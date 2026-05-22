"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Download,
  Search,
  Filter,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Baby
} from 'lucide-react';
import { bumilApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ExportDataPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedType, setSelectedType] = useState<'bidan' | 'usg'>('bidan');
  const [bumils, setBumils] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterName, setFilterName] = useState('');
  const [filterAddress, setFilterAddress] = useState('');
  const [filterKspr, setFilterKspr] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination & Selection
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const pageSize = 10;

  useEffect(() => {
    if (!user || (user.role !== 'bidan' && user.role !== 'dokter' && user.role !== 'superadmin')) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    fetchBumils();
  }, []);

  const fetchBumils = async () => {
    try {
      setIsLoading(true);
      const res = await bumilApi.getAll({ limit: 1000 });
      setBumils(res.data.data || (Array.isArray(res.data) ? res.data : []));
    } catch (error) {
      toast.error('Gagal memuat data ibu hamil');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBumils = bumils.filter(b => {
    const matchName = b.name?.toLowerCase().includes(filterName.toLowerCase()) || b.nik?.includes(filterName);
    const matchAddress = b.address?.toLowerCase().includes(filterAddress.toLowerCase()) || b.kelurahan?.toLowerCase().includes(filterAddress.toLowerCase());

    let matchKspr = true;
    if (filterKspr) {
      const risk = b.riskStatus || (b.ksprScore <= 2 ? 'KRR' : b.ksprScore <= 6 ? 'KRT' : 'KRST');
      matchKspr = risk === filterKspr;
    }

    let matchStatus = true;
    if (filterStatus) {
      const isMelahirkan = b.status?.toLowerCase() === 'melahirkan';
      if (filterStatus === 'hamil') {
        matchStatus = !isMelahirkan;
      } else if (filterStatus === 'melahirkan') {
        matchStatus = isMelahirkan;
      }
    }

    return matchName && matchAddress && matchKspr && matchStatus;
  });

  const totalPages = Math.ceil(filteredBumils.length / pageSize);
  const currentBumils = filteredBumils.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset page & selection when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterName, filterAddress, filterKspr, filterStatus, selectedType]);

  const toggleSelectAll = () => {
    if (selectedIds.length === currentBumils.length && currentBumils.length > 0) {
      setSelectedIds(prev => prev.filter(id => !currentBumils.some(b => b.id === id)));
    } else {
      const newIds = new Set(selectedIds);
      currentBumils.forEach(b => newIds.add(b.id));
      setSelectedIds(Array.from(newIds));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isAllCurrentSelected = currentBumils.length > 0 && currentBumils.every(b => selectedIds.includes(b.id));

  const handleExport = async () => {
    if (selectedIds.length === 0) {
      toast.error('Pilih setidaknya 1 ibu hamil untuk di-export');
      return;
    }

    if (isExporting) return;
    setIsExporting(true);
    const toastId = toast.loading(`Mempersiapkan data ${selectedType === 'bidan' ? 'Catatan Bidan' : 'Catatan USG'}...`);

    try {
      const ExcelJS = (await import('exceljs')).default;
      const { saveAs } = await import('file-saver');

      const workbook = new ExcelJS.Workbook();
      const sheetName = selectedType === 'bidan' ? 'Catatan Bidan' : 'Catatan USG';
      const worksheet = workbook.addWorksheet(sheetName);

      let headers: string[] = [];
      let rows: any[][] = [];

      const exportBumils = filteredBumils.filter(b => selectedIds.includes(b.id));

      if (selectedType === 'bidan') {
        headers = ["NIK", "Nama Ibu Hamil", "Tanggal Periksa", "Minggu Ke", "Berat Badan (Kg)", "TFU", "Status TFU", "Tekanan Darah", "Status Tekanan Darah", "HB", "Status HB", "DJJ", "Status DJJ"];

        for (const bumil of exportBumils) {
          try {
            const checkupsRes = await bumilApi.getCheckups(bumil.id);
            const checkups = checkupsRes.data || [];

            if (checkups.length === 0) {
              rows.push([bumil.nik || '-', bumil.name || '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']);
              continue;
            }

            for (const c of checkups) {
              rows.push([
                bumil.nik || '-', bumil.name || '-',
                c.checkup_date ? new Date(c.checkup_date).toLocaleDateString('id-ID') : '-',
                c.minggu || '-', c.weight || '-', c.tfu || '-', c.tfu_status || '-',
                c.tekanan_darah || '-', c.tekanan_darah_status || '-',
                c.hb || '-', c.hb_status || '-', c.djj || '-', c.djj_status || '-'
              ]);
            }
          } catch (err) {
            console.error(`Gagal mengambil checkup untuk bumil ${bumil.id}`, err);
          }
        }
      } else {
        headers = ["NIK", "Nama Ibu Hamil", "Tanggal Periksa", "Nama Dokter", "Kesimpulan", "Usia Kehamilan (USG)", "HPL (USG)", "Letak Kehamilan", "Jumlah Janin", "Pulsasi Jantung", "Kecurigaan Abnormal"];

        for (const bumil of exportBumils) {
          try {
            const usgRes = await bumilApi.getDoctorCheckups(bumil.id);
            const checkups = usgRes.data || [];

            if (checkups.length === 0) {
              rows.push([bumil.nik || '-', bumil.name || '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']);
              continue;
            }

            for (const c of checkups) {
              rows.push([
                bumil.nik || '-', bumil.name || '-',
                c.checkup_date ? new Date(c.checkup_date).toLocaleDateString('id-ID') : '-',
                c.dokter_name || '-', c.konsep || '-',
                c.usia_kehamilan_usg_minggu ? `${c.usia_kehamilan_usg_minggu} Minggu` : '-',
                c.hpl_usg ? new Date(c.hpl_usg).toLocaleDateString('id-ID') : '-',
                c.letak_kehamilan || '-', c.jumlah_bayi || '-', c.pulsasi_jantung || '-',
                c.kecurigaan_abnormal === 'Ya' ? `Ya: ${c.kecurigaan_abnormal_detail || ''}` : 'Tidak'
              ]);
            }
          } catch (err) {
            console.error(`Gagal mengambil usg untuk bumil ${bumil.id}`, err);
          }
        }
      }

      if (rows.length === 0) {
        toast.error('Gagal menyusun data rekam medis', { id: toastId });
        setIsExporting(false);
        return;
      }

      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9BC2E6' } };
        cell.font = { bold: true, color: { argb: 'FF000000' } };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      rows.forEach(rowData => {
        const row = worksheet.addRow(rowData);
        row.eachCell(cell => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
      });

      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell!({ includeEmpty: true }, cell => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) maxLength = columnLength;
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Export_${selectedType === 'bidan' ? 'Catatan_Bidan' : 'Catatan_USG'}_${new Date().getTime()}.xlsx`);

      toast.success('Export berhasil!', { id: toastId });
    } catch (error) {
      toast.error('Gagal melakukan export data', { id: toastId });
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6 font-sans pb-24">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">

        {/* ── Header ── */}
        <div className="bg-white px-4 md:px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-base md:text-xl font-black text-gray-900 tracking-tight">Export Data</h1>
            <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-0.5">Unduh rekam medis ibu hamil (Excel)</p>
          </div>
        </div>

        {/* ── Filter Panel ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Filter header – Jenis Laporan */}
          <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/40">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-gray-400" /> Filter Data Ibu Hamil
              </h3>
              <div className="flex items-center gap-2 sm:ml-auto">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wide whitespace-nowrap">Jenis Laporan:</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as 'bidan' | 'usg')}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-gray-200 text-xs md:text-sm font-bold text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all bg-white cursor-pointer shadow-sm"
                >
                  <option value="bidan">📝 Catatan Bidan (KIA)</option>
                  <option value="usg">🩺 Catatan USG Dokter</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter inputs – 2 cols on mobile, 4 on lg */}
          <div className="p-4 md:p-6 border-b border-gray-100 bg-white">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div>
                <label className="text-[9px] md:text-[10px] font-black text-gray-400 block uppercase mb-1.5 tracking-wider">Pencarian</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nama atau NIK..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="w-full pl-8 md:pl-9 pr-3 py-2 md:py-2.5 rounded-xl border border-gray-200 text-xs md:text-sm font-medium text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] md:text-[10px] font-black text-gray-400 block uppercase mb-1.5 tracking-wider">Lokasi</label>
                <input
                  type="text"
                  placeholder="Alamat / Kelurahan..."
                  value={filterAddress}
                  onChange={(e) => setFilterAddress(e.target.value)}
                  className="w-full px-3 py-2 md:py-2.5 rounded-xl border border-gray-200 text-xs md:text-sm font-medium text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] md:text-[10px] font-black text-gray-400 block uppercase mb-1.5 tracking-wider">Status Kehamilan</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 md:py-2.5 rounded-xl border border-gray-200 text-xs md:text-sm font-medium text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all bg-white cursor-pointer"
                >
                  <option value="">Semua Status</option>
                  <option value="hamil">Hamil</option>
                  <option value="melahirkan">Melahirkan</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] md:text-[10px] font-black text-gray-400 block uppercase mb-1.5 tracking-wider">Status Risiko KSPR</label>
                <select
                  value={filterKspr}
                  onChange={(e) => setFilterKspr(e.target.value)}
                  className="w-full px-3 py-2 md:py-2.5 rounded-xl border border-gray-200 text-xs md:text-sm font-medium text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all bg-white cursor-pointer"
                >
                  <option value="">Semua Risiko</option>
                  <option value="KRR">Risiko Rendah (KRR)</option>
                  <option value="KRT">Risiko Tinggi (KRT)</option>
                  <option value="KRST">Sangat Tinggi (KRST)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Data body ── */}
          {isLoading ? (
            <div className="p-10 text-center text-gray-400 font-bold flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              Memuat data...
            </div>
          ) : filteredBumils.length === 0 ? (
            <div className="p-10 text-center text-gray-400 font-bold flex flex-col items-center">
              <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm">Tidak ada data ibu hamil.</p>
            </div>
          ) : (
            <>
              {/* ── MOBILE: card list (hidden md+) ── */}
              <div className="md:hidden divide-y divide-gray-50">
                {/* Select-all bar */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/50">
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 cursor-pointer accent-pink-500"
                  />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    {isAllCurrentSelected ? 'Batalkan Semua' : 'Pilih Semua Halaman Ini'}
                  </span>
                  {selectedIds.length > 0 && (
                    <span className="ml-auto text-[10px] font-black text-pink-500 bg-pink-50 px-2.5 py-1 rounded-full">
                      {selectedIds.length} dipilih
                    </span>
                  )}
                </div>

                {currentBumils.map((b) => {
                  const isKrr = (b.ksprScore ?? 0) <= 2;
                  const isKrt = (b.ksprScore ?? 0) > 2 && (b.ksprScore ?? 0) <= 6;
                  const riskLabel = isKrr ? 'KRR' : isKrt ? 'KRT' : 'KRST';
                  const riskColor = isKrr ? 'bg-green-50 text-green-600 border-green-100' : isKrt ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-red-50 text-red-600 border-red-100';
                  const isChecked = selectedIds.includes(b.id);

                  return (
                    <div
                      key={b.id}
                      onClick={() => toggleSelect(b.id)}
                      className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors active:bg-pink-50/50 ${isChecked ? 'bg-pink-50/40' : 'bg-white'}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="w-4 h-4 mt-0.5 shrink-0 text-pink-500 border-gray-300 rounded accent-pink-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-black text-gray-900 truncate">{b.name}</p>
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ${riskColor}`}>{riskLabel}</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 font-mono">{b.nik || '-'}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          {b.address && (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500 truncate max-w-[180px]">
                              <MapPin className="w-3 h-3 text-gray-300 shrink-0" /> {b.kelurahan || b.address}
                            </span>
                          )}
                          <span className={`flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${b.status === 'melahirkan' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                            <Baby className="w-2.5 h-2.5" /> {b.status || 'Hamil'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── DESKTOP: table (hidden below md) ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={isAllCurrentSelected}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Nama &amp; NIK</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Lokasi</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status &amp; Risiko</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentBumils.map((b) => {
                      const isKrr = b.ksprScore <= 2;
                      const isKrt = b.ksprScore > 2 && b.ksprScore <= 6;
                      const isChecked = selectedIds.includes(b.id);

                      return (
                        <tr
                          key={b.id}
                          className={`transition-colors ${isChecked ? 'bg-pink-50/50' : 'hover:bg-gray-50/50'}`}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelect(b.id)}
                              className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-black text-gray-900">{b.name}</p>
                            <p className="text-[10px] font-bold text-gray-500 mt-0.5">{b.nik || '-'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-gray-900 max-w-[200px] truncate">{b.address || '-'}</p>
                            <p className="text-[10px] font-bold text-gray-500 mt-0.5">{b.kelurahan || '-'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${b.status === 'melahirkan' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                {b.status || 'Hamil'}
                              </span>
                              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${isKrr ? 'bg-green-50 text-green-600' : isKrt ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                                {isKrr ? 'KRR' : isKrt ? 'KRT' : 'KRST'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── Pagination ── */}
          {!isLoading && filteredBumils.length > 0 && (
            <div className="px-4 md:px-6 py-3 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
              <p className="text-[10px] md:text-xs font-bold text-gray-500 leading-tight">
                <span className="text-gray-900">{Math.min((currentPage - 1) * pageSize + 1, filteredBumils.length)}</span>
                {' – '}
                <span className="text-gray-900">{Math.min(currentPage * pageSize, filteredBumils.length)}</span>
                {' dari '}
                <span className="text-gray-900">{filteredBumils.length}</span> data
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-black text-gray-900 px-1 tabular-nums">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sticky Download Button ── */}
        <div className="sticky bottom-4 z-30">
          <button
            onClick={handleExport}
            disabled={isExporting || isLoading || selectedIds.length === 0}
            className="w-full py-3.5 md:py-4 px-6 md:px-10 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-sm shadow-xl shadow-green-200/60 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:active:scale-100"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            {isExporting
              ? 'Mempersiapkan File...'
              : selectedIds.length === 0
                ? 'Pilih Data untuk Di-download'
                : `Download ${selectedIds.length} Data Terpilih (Excel)`}
          </button>
        </div>

      </div>
    </div>
  );
}
