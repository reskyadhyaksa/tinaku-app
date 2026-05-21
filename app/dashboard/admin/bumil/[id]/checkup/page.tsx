"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Calendar, 
  Activity, 
  Heart, 
  TrendingUp, 
  Scale, 
  Droplets,
  Plus, 
  Trash2, 
  Stethoscope, 
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Info
} from 'lucide-react';
import { bumilApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function BidanBumilCheckupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [bumil, setBumil] = useState<any>(null);
  const [checkups, setCheckups] = useState<any[]>([]);
  const [doctorCheckups, setDoctorCheckups] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // View selector state: 'catat_bidan' | 'catat_dokter' | 'histori'
  const [currentView, setCurrentView] = useState<'catat_bidan' | 'catat_dokter' | 'histori'>('catat_bidan');

  // History sub-tab state inside Histori view
  const [historyTab, setHistoryTab] = useState<'midwife' | 'doctor'>('midwife');

  // Automatically set active view and history tab based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'dokter') {
        setCurrentView('catat_dokter');
        setHistoryTab('doctor');
      } else {
        setCurrentView('catat_bidan');
        setHistoryTab('midwife');
      }
    }
  }, [user]);

  // 1. Midwife Form State
  const [form, setForm] = useState({
    checkup_date: new Date().toISOString().split('T')[0],
    week: '28',
    hb: '',
    hb_status: 'Normal',
    sys: '',
    dia: '',
    tekanan_darah_status: 'Normal',
    tfu: '',
    tfu_status: 'Sesuai',
    djj: '',
    djj_status: 'Baik',
    weight: ''
  });

  // 2. Doctor Form State
  const [docForm, setDocForm] = useState({
    dokter_name: '',
    checkup_date: new Date().toISOString().split('T')[0],
    konsep: 'Normal',
    
    // Keadaan Umum (Pemeriksaan Fisik)
    konjungtiva: 'Tidak Anemia',
    sklera: 'Tidak Ikterik',
    kulit: 'Normal',
    leher: 'Normal',
    gigi_mulut: 'Normal',
    tht: 'Normal',
    dada_jantung: 'Normal',
    dada_paru: 'Normal',
    perut: 'Normal',
    tungkai: 'Normal',
    
    // USG Trimester I
    hpht: '',
    keteraturan_haid: 'Teratur',
    usia_kehamilan_hpht_weeks: '',
    hpl_hpht: '',
    usia_kehamilan_usg_weeks: '',
    hpl_usg: '',
    
    jumlah_gs: 'Tunggal',
    diameter_gs: '',
    diameter_gs_weeks: '',
    diameter_gs_days: '',
    
    jumlah_bayi: 'Tunggal',
    crl: '',
    crl_weeks: '',
    crl_days: '',
    
    letak_kehamilan: 'Intrauterin',
    pulsasi_jantung: 'Tampak',
    kecurigaan_abnormal: 'Tidak',
    kecurigaan_abnormal_detail: ''
  });

  // Default doctor name to currently logged-in user if their role is doctor
  useEffect(() => {
    if (user && (user.role === 'dokter' || user.role === 'superadmin')) {
      setDocForm(prev => ({ ...prev, dokter_name: user.name }));
    }
  }, [user]);

  // Calendar states
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date());

  // Doctor Popover Calendar States
  const [isDocCalendarOpen, setIsDocCalendarOpen] = useState(false);
  const [calendarDateDoc, setCalendarDateDoc] = useState<Date>(() => new Date());

  const [isDocHphtOpen, setIsDocHphtOpen] = useState(false);
  const [calendarDateDocHpht, setCalendarDateDocHpht] = useState<Date>(() => new Date());

  const [isDocHplHphtOpen, setIsDocHplHphtOpen] = useState(false);
  const [calendarDateDocHplHpht, setCalendarDateDocHplHpht] = useState<Date>(() => new Date());

  const [isDocHplUsgOpen, setIsDocHplUsgOpen] = useState(false);
  const [calendarDateDocHplUsg, setCalendarDateDocHplUsg] = useState<Date>(() => new Date());

  const monthsList = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysList = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Month navigation handlers
  const handlePrevMonth = () => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const handlePrevMonthDoc = () => setCalendarDateDoc(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonthDoc = () => setCalendarDateDoc(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const handlePrevMonthDocHpht = () => setCalendarDateDocHpht(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonthDocHpht = () => setCalendarDateDocHpht(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const handlePrevMonthDocHplHpht = () => setCalendarDateDocHplHpht(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonthDocHplHpht = () => setCalendarDateDocHplHpht(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const handlePrevMonthDocHplUsg = () => setCalendarDateDocHplUsg(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonthDocHplUsg = () => setCalendarDateDocHplUsg(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  // Selection handlers
  const handleSelectDay = (day: number) => {
    const selected = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    const offset = selected.getTimezoneOffset();
    const localDate = new Date(selected.getTime() - (offset * 60 * 1000));
    setForm(prev => ({ ...prev, checkup_date: localDate.toISOString().split('T')[0] }));
    setIsCalendarOpen(false);
  };

  const handleSelectDayDoc = (day: number) => {
    const selected = new Date(calendarDateDoc.getFullYear(), calendarDateDoc.getMonth(), day);
    const offset = selected.getTimezoneOffset();
    const localDate = new Date(selected.getTime() - (offset * 60 * 1000));
    setDocForm(prev => ({ ...prev, checkup_date: localDate.toISOString().split('T')[0] }));
    setIsDocCalendarOpen(false);
  };

  const handleSelectDayDocHpht = (day: number) => {
    const selected = new Date(calendarDateDocHpht.getFullYear(), calendarDateDocHpht.getMonth(), day);
    const offset = selected.getTimezoneOffset();
    const localDate = new Date(selected.getTime() - (offset * 60 * 1000));
    const formattedDate = localDate.toISOString().split('T')[0];
    
    // Auto-calculate suggested HPL based on HPHT (HPHT + 280 days Naegele's rule)
    const suggestedHpl = new Date(localDate.getTime() + 280 * 24 * 60 * 60 * 1000);
    const suggestedHplStr = suggestedHpl.toISOString().split('T')[0];

    setDocForm(prev => ({ 
      ...prev, 
      hpht: formattedDate,
      hpl_hpht: suggestedHplStr
    }));
    setIsDocHphtOpen(false);
  };

  const handleSelectDayDocHplHpht = (day: number) => {
    const selected = new Date(calendarDateDocHplHpht.getFullYear(), calendarDateDocHplHpht.getMonth(), day);
    const offset = selected.getTimezoneOffset();
    const localDate = new Date(selected.getTime() - (offset * 60 * 1000));
    setDocForm(prev => ({ ...prev, hpl_hpht: localDate.toISOString().split('T')[0] }));
    setIsDocHplHphtOpen(false);
  };

  const handleSelectDayDocHplUsg = (day: number) => {
    const selected = new Date(calendarDateDocHplUsg.getFullYear(), calendarDateDocHplUsg.getMonth(), day);
    const offset = selected.getTimezoneOffset();
    const localDate = new Date(selected.getTime() - (offset * 60 * 1000));
    setDocForm(prev => ({ ...prev, hpl_usg: localDate.toISOString().split('T')[0] }));
    setIsDocHplUsgOpen(false);
  };

  // Sync calendar Dates when form values change
  useEffect(() => {
    if (form.checkup_date) setCalendarDate(new Date(form.checkup_date));
  }, [form.checkup_date]);

  useEffect(() => {
    if (docForm.checkup_date) setCalendarDateDoc(new Date(docForm.checkup_date));
  }, [docForm.checkup_date]);

  useEffect(() => {
    if (docForm.hpht) setCalendarDateDocHpht(new Date(docForm.hpht));
  }, [docForm.hpht]);

  useEffect(() => {
    if (docForm.hpl_hpht) setCalendarDateDocHplHpht(new Date(docForm.hpl_hpht));
  }, [docForm.hpl_hpht]);

  useEffect(() => {
    if (docForm.hpl_usg) setCalendarDateDocHplUsg(new Date(docForm.hpl_usg));
  }, [docForm.hpl_usg]);

  useEffect(() => {
    if (!user || (user.role !== 'bidan' && user.role !== 'dokter' && user.role !== 'superadmin')) {
      router.push('/login');
    } else {
      fetchData();
    }
  }, [user, id]);

  // Automated Status Calculations for Midwife form
  useEffect(() => {
    if (form.hb) {
      const hbVal = parseFloat(form.hb);
      if (!isNaN(hbVal)) {
        setForm(prev => ({ ...prev, hb_status: hbVal < 11.0 ? 'Anemia / Rendah' : 'Normal' }));
      }
    }
  }, [form.hb]);

  useEffect(() => {
    if (form.sys && form.dia) {
      const sysVal = parseInt(form.sys);
      const diaVal = parseInt(form.dia);
      if (!isNaN(sysVal) && !isNaN(diaVal)) {
        if (sysVal >= 140 || diaVal >= 90) {
          setForm(prev => ({ ...prev, tekanan_darah_status: 'Hipertensi' }));
        } else if (sysVal >= 130 || diaVal >= 80) {
          setForm(prev => ({ ...prev, tekanan_darah_status: 'Pantau' }));
        } else {
          setForm(prev => ({ ...prev, tekanan_darah_status: 'Normal' }));
        }
      }
    }
  }, [form.sys, form.dia]);

  useEffect(() => {
    if (form.djj) {
      const djjVal = parseInt(form.djj);
      if (!isNaN(djjVal)) {
        if (djjVal >= 110 && djjVal <= 160) {
          setForm(prev => ({ ...prev, djj_status: 'Baik' }));
        } else if (djjVal > 0) {
          setForm(prev => ({ ...prev, djj_status: 'Gawat Janin' }));
        }
      }
    }
  }, [form.djj]);

  useEffect(() => {
    if (form.tfu && form.week) {
      const tfuVal = parseFloat(form.tfu);
      const weekVal = parseInt(form.week);
      if (!isNaN(tfuVal) && !isNaN(weekVal)) {
        if (weekVal < 20) {
          setForm(prev => ({ ...prev, tfu_status: 'Sesuai' }));
        } else {
          let minTfu = weekVal - 5;
          let maxTfu = weekVal - 1;
          if (weekVal >= 33 && weekVal <= 36) {
            minTfu = weekVal - 6;
            maxTfu = weekVal - 2;
          } else if (weekVal >= 37 && weekVal <= 42) {
            minTfu = 31;
            maxTfu = 36;
          }
          setForm(prev => ({ ...prev, tfu_status: (tfuVal >= minTfu && tfuVal <= maxTfu) ? 'Sesuai' : 'Pantau' }));
        }
      }
    }
  }, [form.tfu, form.week]);

  // Automated USG pregnancy age HPL calculations based on input weeks
  useEffect(() => {
    if (docForm.checkup_date && docForm.usia_kehamilan_usg_weeks) {
      const checkupDate = new Date(docForm.checkup_date);
      const usgWeeks = parseInt(docForm.usia_kehamilan_usg_weeks);
      if (!isNaN(usgWeeks)) {
        // Calculate remaining pregnancy days out of 280 days
        const remainingDays = (40 - usgWeeks) * 7;
        const calculatedHpl = new Date(checkupDate.getTime() + remainingDays * 24 * 60 * 60 * 1000);
        setDocForm(prev => ({ ...prev, hpl_usg: calculatedHpl.toISOString().split('T')[0] }));
      }
    }
  }, [docForm.checkup_date, docForm.usia_kehamilan_usg_weeks]);

  const fetchData = async () => {
    try {
      setIsFetching(true);
      const [bumilRes, checkupRes, docCheckupRes] = await Promise.all([
        bumilApi.getById(id as string),
        bumilApi.getCheckups(id as string),
        bumilApi.getDoctorCheckups(id as string)
      ]);
      setBumil(bumilRes.data);
      setCheckups(checkupRes.data || []);
      setDoctorCheckups(docCheckupRes.data || []);
      
      // Auto-suggest pregnancy week based on HPL if available
      if (bumilRes.data.hpl) {
        const hplDate = new Date(bumilRes.data.hpl);
        const today = new Date();
        const diffMs = hplDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const daysPregnant = Math.max(0, 280 - diffDays);
        const currentWeek = Math.floor(daysPregnant / 7);
        if (currentWeek > 0 && currentWeek <= 42) {
          setForm(prev => ({ ...prev, week: currentWeek.toString() }));
        }
      }

      // Populate doctor HPHT from Bumil profile if profile has it
      if (bumilRes.data.hpht) {
        setDocForm(prev => ({ 
          ...prev, 
          hpht: bumilRes.data.hpht.split('T')[0],
          hpl_hpht: bumilRes.data.hpl ? bumilRes.data.hpl.split('T')[0] : ''
        }));
      }
    } catch (error) {
      toast.error('Gagal mengambil data pemeriksaan');
      router.push('/dashboard/admin/bumil');
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDocInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitCheckup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hb || !form.sys || !form.dia || !form.tfu || !form.djj || !form.weight) {
      toast.error('Semua data pemeriksaan klinis wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        checkup_date: form.checkup_date,
        week: form.week,
        hb: parseFloat(form.hb),
        hb_status: form.hb_status,
        tekanan_darah: `${form.sys}/${form.dia}`,
        tekanan_darah_status: form.tekanan_darah_status,
        tfu: parseFloat(form.tfu),
        tfu_status: form.tfu_status,
        djj: parseInt(form.djj),
        djj_status: form.djj_status,
        weight: parseFloat(form.weight)
      };

      await bumilApi.createCheckup(id as string, payload);
      toast.success('Pemeriksaan kebidanan berhasil disimpan!');
      
      setForm(prev => ({
        ...prev,
        hb: '',
        sys: '',
        dia: '',
        tfu: '',
        djj: '',
        weight: ''
      }));

      const checkupRes = await bumilApi.getCheckups(id as string);
      setCheckups(checkupRes.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan pemeriksaan medis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDocCheckup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.dokter_name || !docForm.checkup_date) {
      toast.error('Nama Dokter dan Tanggal Pemeriksaan wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...docForm,
        usia_kehamilan_hpht_weeks: docForm.usia_kehamilan_hpht_weeks ? parseInt(docForm.usia_kehamilan_hpht_weeks) : null,
        usia_kehamilan_usg_weeks: docForm.usia_kehamilan_usg_weeks ? parseInt(docForm.usia_kehamilan_usg_weeks) : null,
        diameter_gs: docForm.diameter_gs ? parseFloat(docForm.diameter_gs) : null,
        diameter_gs_weeks: docForm.diameter_gs_weeks ? parseInt(docForm.diameter_gs_weeks) : null,
        diameter_gs_days: docForm.diameter_gs_days ? parseInt(docForm.diameter_gs_days) : null,
        crl: docForm.crl ? parseFloat(docForm.crl) : null,
        crl_weeks: docForm.crl_weeks ? parseInt(docForm.crl_weeks) : null,
        crl_days: docForm.crl_days ? parseInt(docForm.crl_days) : null,
        hpht: docForm.hpht || null,
        hpl_hpht: docForm.hpl_hpht || null,
        hpl_usg: docForm.hpl_usg || null
      };

      await bumilApi.createDoctorCheckup(id as string, payload);
      toast.success('Pemeriksaan Dokter & USG berhasil disimpan!');
      
      // Reset USG input parameters but preserve general fields
      setDocForm(prev => ({
        ...prev,
        usia_kehamilan_usg_weeks: '',
        diameter_gs: '',
        diameter_gs_weeks: '',
        diameter_gs_days: '',
        crl: '',
        crl_weeks: '',
        crl_days: '',
        kecurigaan_abnormal_detail: ''
      }));

      const docCheckupRes = await bumilApi.getDoctorCheckups(id as string);
      setDoctorCheckups(docCheckupRes.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan pemeriksaan USG.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCheckup = async (checkupId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data pemeriksaan ini?')) return;
    try {
      await bumilApi.deleteCheckup(id as string, checkupId);
      toast.success('Pemeriksaan kebidanan berhasil dihapus');
      const checkupRes = await bumilApi.getCheckups(id as string);
      setCheckups(checkupRes.data || []);
    } catch (error) {
      toast.error('Gagal menghapus pemeriksaan.');
    }
  };

  const handleDeleteDocCheckup = async (checkupId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data pemeriksaan dokter ini?')) return;
    try {
      await bumilApi.deleteDoctorCheckup(id as string, checkupId);
      toast.success('Pemeriksaan dokter berhasil dihapus');
      const docCheckupRes = await bumilApi.getDoctorCheckups(id as string);
      setDoctorCheckups(docCheckupRes.data || []);
    } catch (error) {
      toast.error('Gagal menghapus pemeriksaan dokter.');
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="animate-pulse text-pink-500 font-bold text-xl text-center">
          Mengambil data klinis ibu hamil...<br/>
          <span className="text-sm font-normal text-gray-400 italic">Harap tunggu sebentar</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans pb-24">
      {/* Hide default browser up/down arrows for numeric inputs */}
      <style jsx global>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      <div className="max-w-[800px] mx-auto space-y-8">
        
        {/* Header & Back Action */}
        <div className="bg-white p-6 md:px-8 md:py-6 rounded-3xl shadow-sm border border-pink-100 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
              <button 
                onClick={() => router.push('/dashboard/admin/bumil')} 
                className="h-12 w-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm shrink-0 self-start md:self-auto"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-full">
                <div className="flex flex-col gap-1.5 items-start">
                  <span className="px-2.5 py-0.5 bg-pink-100 text-pink-700 text-[10px] font-black uppercase rounded-full">
                    {user?.role === 'dokter' ? 'Dokter Panel' : user?.role === 'superadmin' ? 'Superadmin' : 'Bidan Panel'}
                  </span>
                  <h1 className="text-xl md:text-2xl font-black text-gray-900">Pemeriksaan Medis</h1>
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 bg-pink-50/40 border border-pink-100/50 p-4 rounded-[24px] w-full flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-black text-gray-400 leading-none">Ibu Hamil</span>
                      <span className="text-xs md:text-sm font-extrabold text-gray-800 mt-1">{bumil?.name}</span>
                    </div>
                  </div>
                  <div className="hidden sm:block h-8 w-[1px] bg-pink-100/80" />
                  <div className="flex items-center gap-3 border-t border-pink-100/30 sm:border-t-0 pt-3 sm:pt-0">
                    <div className="h-9 w-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 shrink-0">
                      <Heart className="w-4.5 h-4.5 fill-current/10" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-black text-gray-400 leading-none">NIK</span>
                      <span className="text-xs font-mono font-bold text-gray-800 mt-1">{bumil?.nik || '-'}</span>
                    </div>
                  </div>
                  <div className="hidden sm:block h-8 w-[1px] bg-pink-100/80" />
                  <div className="flex items-center gap-3 border-t border-pink-100/30 sm:border-t-0 pt-3 sm:pt-0">
                    <div className="h-9 w-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 shrink-0">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-black text-gray-400 leading-none">Usia</span>
                      <span className="text-xs font-bold text-gray-800 mt-1">{bumil?.age || '?'} Thn</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Tab Selection Navigation for View Modes (Full width, spacious layout) */}
          <div className="pt-4 border-t border-gray-50 w-full">
            <div className="flex flex-col sm:flex-row bg-gray-50/50 p-2 rounded-[24px] border border-gray-100 gap-2 shadow-sm w-full">
              {(user?.role === 'bidan' || user?.role === 'superadmin') && (
                <button
                  type="button"
                  onClick={() => setCurrentView('catat_bidan')}
                  className={`flex-1 py-3.5 px-6 rounded-[18px] text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                    currentView === 'catat_bidan' 
                      ? 'bg-white text-pink-600 border border-pink-100/50' 
                      : 'text-gray-400 hover:text-pink-500 hover:bg-white/50 border border-transparent'
                  }`}
                >
                  <Heart className="w-4 h-4" /> Catat Bidan
                </button>
              )}
              {(user?.role === 'dokter' || user?.role === 'superadmin') && (
                <button
                  type="button"
                  onClick={() => setCurrentView('catat_dokter')}
                  className={`flex-1 py-3.5 px-6 rounded-[18px] text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                    currentView === 'catat_dokter' 
                      ? 'bg-white text-pink-600 border border-pink-100/50' 
                      : 'text-gray-400 hover:text-pink-500 hover:bg-white/50 border border-transparent'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" /> Catat USG
                </button>
              )}
              <button
                type="button"
                onClick={() => setCurrentView('histori')}
                className={`flex-1 py-3.5 px-6 rounded-[18px] text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                  currentView === 'histori' 
                    ? 'bg-white text-pink-600 border border-pink-100/50' 
                    : 'text-gray-400 hover:text-pink-500 hover:bg-white/50 border border-transparent'
                }`}
              >
                <Clock className="w-4 h-4" /> Histori Medis
              </button>
            </div>
          </div>
        </div>

        {/* Main Stack Content */}
        <div className="space-y-6">
          
          {/* VIEW 1: CATAT PEMERIKSAAN BIDAN */}
          {currentView === 'catat_bidan' && (
            <div className="bg-white rounded-[36px] shadow-sm border border-pink-100 overflow-hidden p-6 md:p-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-150">
                <div className="h-10 w-10 bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-black text-gray-900">Catat Hasil Pemeriksaan Bidan</h2>
                  <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                    Formulir Rekam Medis Kebidanan / KIA Berkala
                  </p>
                </div>
              </div>

              {/* FORM 1: MIDWIFE CHECKUP FORM */}
              <form onSubmit={handleSubmitCheckup} className="space-y-5">
                
                {/* Date & Week */}
                <div className="bg-pink-50/10 p-5 rounded-[28px] border border-pink-100/30 space-y-4 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tanggal Pemeriksaan</label>
                      <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm focus-within:border-pink-300 transition-all">
                        <button 
                          type="button"
                          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                          className="pl-4 pr-1 text-pink-500 shrink-0 hover:scale-110 active:scale-95 transition-all outline-none"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <input 
                          type="text" 
                          readOnly
                          value={form.checkup_date ? new Date(form.checkup_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} 
                          onClick={() => setIsCalendarOpen(true)}
                          className="w-full pl-2 pr-4 py-3.5 rounded-2xl text-xs font-bold text-gray-700 outline-none border-none focus:ring-0 bg-transparent cursor-pointer"
                        />

                        {isCalendarOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsCalendarOpen(false)} />
                            <div className="absolute top-full left-0 z-50 mt-2 bg-white rounded-3xl p-4 shadow-xl border border-pink-100 w-[280px] sm:w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="flex items-center justify-between mb-4 pb-2 border-b border-pink-50">
                                <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-pink-50 rounded-lg text-pink-500 font-bold transition-colors text-sm">&larr;</button>
                                <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider">{monthsList[calendarDate.getMonth()]} {calendarDate.getFullYear()}</span>
                                <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-pink-50 rounded-lg text-pink-500 font-bold transition-colors text-sm">&rarr;</button>
                              </div>
                              <div className="grid grid-cols-7 gap-1 mb-2">
                                {daysList.map(d => <span key={d} className="text-[9px] font-black text-pink-300 uppercase text-center">{d}</span>)}
                              </div>
                              <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: getFirstDayOfMonth(calendarDate.getFullYear(), calendarDate.getMonth()) }).map((_, i) => <div key={`empty-${i}`} />)}
                                {Array.from({ length: getDaysInMonth(calendarDate.getFullYear(), calendarDate.getMonth()) }).map((_, i) => {
                                  const dayNum = i + 1;
                                  const isSelected = form.checkup_date && new Date(form.checkup_date).getDate() === dayNum && new Date(form.checkup_date).getMonth() === calendarDate.getMonth() && new Date(form.checkup_date).getFullYear() === calendarDate.getFullYear();
                                  const isToday = new Date().getDate() === dayNum && new Date().getMonth() === calendarDate.getMonth() && new Date().getFullYear() === calendarDate.getFullYear();
                                  return (
                                    <button
                                      key={`day-${dayNum}`}
                                      type="button"
                                      onClick={() => handleSelectDay(dayNum)}
                                      className={`py-1.5 rounded-xl text-center text-xs font-bold transition-all ${
                                        isSelected ? 'bg-pink-500 text-white shadow-md font-black' : isToday ? 'bg-pink-50 text-pink-600 border border-pink-200' : 'hover:bg-gray-50 text-gray-700'
                                      }`}
                                    >
                                      {dayNum}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Usia Gestasi</label>
                      <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm focus-within:border-pink-300 transition-all">
                        <div className="pl-4 pr-1 text-pink-500 shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <input 
                          type="number" 
                          name="week" 
                          value={form.week} 
                          onChange={handleInputChange} 
                          required 
                          min={1} 
                          max={45} 
                          placeholder="Contoh: 28"
                          className="w-full pl-2 pr-16 py-3.5 rounded-2xl text-xs font-black text-gray-755 outline-none border-none focus:ring-0 bg-transparent transition-all"
                        />
                        <span className="absolute right-3 text-[9px] font-black text-pink-500 uppercase bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-md">Minggu</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HB */}
                <div className="bg-blue-50/20 p-4 rounded-3xl border border-blue-100/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-700 flex items-center gap-1.5 uppercase tracking-wide">
                      <Droplets className="w-4 h-4 text-blue-500 fill-current" /> Hemoglobin (HB)
                    </span>
                    {form.hb ? (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                        form.hb_status === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-650 border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${form.hb_status === 'Normal' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {form.hb_status === 'Normal' ? 'NORMAL' : 'ANEMIA'}
                      </span>
                    ) : <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase">Menunggu Input...</span>}
                  </div>
                  <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm">
                    <input 
                      type="number" step="0.1" name="hb" value={form.hb} onChange={handleInputChange} required placeholder="Contoh: 11.3" 
                      className="w-full px-5 py-4 rounded-2xl text-sm font-bold text-gray-700 outline-none border-none focus:ring-2 focus:ring-blue-100 transition-all bg-transparent"
                    />
                    <span className="absolute right-5 text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">g/dL</span>
                  </div>
                </div>

                {/* Tensi */}
                <div className="bg-rose-50/20 p-4 rounded-3xl border border-rose-100/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-700 flex items-center gap-1.5 uppercase tracking-wide">
                      <Activity className="w-4 h-4 text-rose-500" /> Tekanan Darah (SYS/DIA)
                    </span>
                    {form.sys && form.dia ? (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                        form.tekanan_darah_status === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 
                        form.tekanan_darah_status === 'Pantau' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-red-50 text-red-650 border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          form.tekanan_darah_status === 'Normal' ? 'bg-green-500' : 
                          form.tekanan_darah_status === 'Pantau' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        {form.tekanan_darah_status === 'Normal' ? 'NORMAL' : form.tekanan_darah_status === 'Pantau' ? 'PANTAU' : 'HIPERTENSI'}
                      </span>
                    ) : <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase">Menunggu Input...</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm">
                      <input 
                        type="number" name="sys" value={form.sys} onChange={handleInputChange} required placeholder="Sistolik (e.g. 120)" 
                        className="w-full px-5 py-4 rounded-2xl text-sm font-bold text-gray-700 outline-none border-none focus:ring-2 focus:ring-rose-100 transition-all bg-transparent"
                      />
                      <span className="absolute right-4 text-[10px] font-bold text-gray-400">mmHg</span>
                    </div>
                    <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm">
                      <input 
                        type="number" name="dia" value={form.dia} onChange={handleInputChange} required placeholder="Diastolik (e.g. 80)" 
                        className="w-full px-5 py-4 rounded-2xl text-sm font-bold text-gray-700 outline-none border-none focus:ring-2 focus:ring-rose-100 transition-all bg-transparent"
                      />
                      <span className="absolute right-4 text-[10px] font-bold text-gray-400">mmHg</span>
                    </div>
                  </div>
                </div>

                {/* TFU */}
                <div className="bg-amber-50/20 p-4 rounded-3xl border border-amber-100/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-700 flex items-center gap-1.5 uppercase tracking-wide">
                      <TrendingUp className="w-4 h-4 text-amber-500" /> Tinggi Fundus (TFU)
                    </span>
                    {form.tfu ? (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                        form.tfu_status === 'Sesuai' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${form.tfu_status === 'Sesuai' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                        {form.tfu_status === 'Sesuai' ? 'SESUAI' : 'PANTAU'}
                      </span>
                    ) : <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase">Menunggu Input...</span>}
                  </div>
                  <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm">
                    <input 
                      type="number" step="0.1" name="tfu" value={form.tfu} onChange={handleInputChange} required placeholder="Contoh: 26" 
                      className="w-full px-5 py-4 rounded-2xl text-sm font-bold text-gray-700 outline-none border-none focus:ring-2 focus:ring-amber-100 transition-all bg-transparent"
                    />
                    <span className="absolute right-5 text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">cm</span>
                  </div>
                </div>

                {/* DJJ */}
                <div className="bg-emerald-50/20 p-4 rounded-3xl border border-emerald-100/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-700 flex items-center gap-1.5 uppercase tracking-wide">
                      <Heart className="w-4 h-4 text-emerald-500" /> Denyut Jantung Janin (DJJ)
                    </span>
                    {form.djj ? (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                        form.djj_status === 'Baik' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-650 border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${form.djj_status === 'Baik' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {form.djj_status === 'Baik' ? 'BAIK' : 'GAWAT JANIN'}
                      </span>
                    ) : <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase">Menunggu Input...</span>}
                  </div>
                  <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm">
                    <input 
                      type="number" name="djj" value={form.djj} onChange={handleInputChange} required placeholder="Contoh: 142" 
                      className="w-full px-5 py-4 rounded-2xl text-sm font-bold text-gray-700 outline-none border-none focus:ring-2 focus:ring-emerald-100 transition-all bg-transparent"
                    />
                    <span className="absolute right-5 text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">bpm</span>
                  </div>
                </div>

                {/* Weight */}
                <div className="bg-indigo-50/20 p-4 rounded-3xl border border-indigo-100/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-700 flex items-center gap-1.5 uppercase tracking-wide">
                      <Scale className="w-4 h-4 text-indigo-500" /> Berat Badan Ibu
                    </span>
                  </div>
                  <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm">
                    <input 
                      type="number" step="0.1" name="weight" value={form.weight} onChange={handleInputChange} required placeholder="Contoh: 65.5" 
                      className="w-full px-5 py-4 rounded-2xl text-sm font-bold text-gray-700 outline-none border-none focus:ring-2 focus:ring-indigo-100 transition-all bg-transparent"
                    />
                    <span className="absolute right-5 text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">kg</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-pink-500 text-white font-extrabold py-4 px-6 rounded-3xl shadow-lg hover:bg-pink-600 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Hasil Bidan'}
                  <Save className="w-4 h-4" />
                </button>

              </form>
            </div>
          )}

          {/* VIEW 2: CATAT PEMERIKSAAN USG DOKTER */}
          {currentView === 'catat_dokter' && (
            <div className="bg-white rounded-[36px] shadow-sm border border-pink-100 overflow-hidden p-6 md:p-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-150">
                <div className="h-10 w-10 bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-black text-gray-900">Pemeriksaan USG Dokter</h2>
                  <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                    Formulir Rekam Medis & USG Trimester I
                  </p>
                </div>
              </div>

              {/* FORM 2: DOCTOR / USG EXAM FORM */}
              <form onSubmit={handleSubmitDocCheckup} className="space-y-6">
                
                {/* Doctor Info Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-pink-50/10 p-4 rounded-3xl border border-pink-100/20">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nama Dokter</label>
                    <input 
                      type="text" 
                      name="dokter_name" 
                      value={docForm.dokter_name} 
                      onChange={handleDocInputChange} 
                      required 
                      placeholder="dr. Sp.OG / Umum"
                      className="w-full px-4 py-3 border border-gray-100 bg-white rounded-2xl text-xs font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-pink-100 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tanggal Periksa</label>
                    <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm focus-within:border-pink-300 transition-all">
                      <button 
                        type="button"
                        onClick={() => setIsDocCalendarOpen(!isDocCalendarOpen)}
                        className="pl-4 pr-1 text-pink-500 shrink-0 hover:scale-110 active:scale-95 transition-all outline-none"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <input 
                        type="text" 
                        readOnly
                        value={docForm.checkup_date ? new Date(docForm.checkup_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} 
                        onClick={() => setIsDocCalendarOpen(true)}
                        className="w-full pl-2 pr-4 py-3 text-xs font-bold text-gray-700 outline-none border-none focus:ring-0 bg-transparent cursor-pointer"
                      />

                      {isDocCalendarOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsDocCalendarOpen(false)} />
                          <div className="absolute top-full left-0 z-50 mt-2 bg-white rounded-3xl p-4 shadow-xl border border-pink-100 w-[280px] sm:w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-pink-50">
                              <button type="button" onClick={handlePrevMonthDoc} className="p-1 hover:bg-pink-50 rounded-lg text-pink-500 font-bold transition-colors text-sm">&larr;</button>
                              <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider">{monthsList[calendarDateDoc.getMonth()]} {calendarDateDoc.getFullYear()}</span>
                              <button type="button" onClick={handleNextMonthDoc} className="p-1 hover:bg-pink-50 rounded-lg text-pink-500 font-bold transition-colors text-sm">&rarr;</button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 mb-2">
                              {daysList.map(d => <span key={d} className="text-[9px] font-black text-pink-300 uppercase text-center">{d}</span>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {Array.from({ length: getFirstDayOfMonth(calendarDateDoc.getFullYear(), calendarDateDoc.getMonth()) }).map((_, i) => <div key={`empty-${i}`} />)}
                              {Array.from({ length: getDaysInMonth(calendarDateDoc.getFullYear(), calendarDateDoc.getMonth()) }).map((_, i) => {
                                const dayNum = i + 1;
                                const isSelected = docForm.checkup_date && new Date(docForm.checkup_date).getDate() === dayNum && new Date(docForm.checkup_date).getMonth() === calendarDateDoc.getMonth() && new Date(docForm.checkup_date).getFullYear() === calendarDateDoc.getFullYear();
                                const isToday = new Date().getDate() === dayNum && new Date().getMonth() === calendarDateDoc.getMonth() && new Date().getFullYear() === calendarDateDoc.getFullYear();
                                return (
                                  <button
                                    key={`day-doc-${dayNum}`}
                                    type="button"
                                    onClick={() => handleSelectDayDoc(dayNum)}
                                    className={`py-1.5 rounded-xl text-center text-xs font-bold transition-all ${
                                      isSelected ? 'bg-pink-500 text-white shadow-md font-black' : isToday ? 'bg-pink-50 text-pink-600 border border-pink-200' : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    {dayNum}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Konsep/Kesimpulan Diagnosa */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Kesimpulan Risiko Kehamilan</label>
                  <div className="relative">
                    <select 
                      name="konsep" 
                      value={docForm.konsep} 
                      onChange={handleDocInputChange}
                      className="w-full appearance-none pr-10 px-4 py-3.5 border border-gray-100 bg-gray-50 focus:bg-white rounded-2xl text-xs font-bold text-gray-700 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                    >
                      <option value="Normal">Kehamilan Normal / Tanpa Masalah</option>
                      <option value="Berisiko">Kehamilan Bermasalah / Berisiko Tinggi</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* 1. PEMERIKSAAN FISIK - KEADAAN UMUM */}
                <div className="space-y-4 p-5 bg-gray-50/50 rounded-3xl border border-gray-100">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    🩺 Pemeriksaan Fisik (Keadaan Umum)
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Konjungtiva', name: 'konjungtiva', options: ['Tidak Anemia', 'Anemia'] },
                      { label: 'Sklera', name: 'sklera', options: ['Tidak Ikterik', 'Ikterik'] },
                      { label: 'Kulit', name: 'kulit', options: ['Normal', 'Tidak normal'] },
                      { label: 'Leher', name: 'leher', options: ['Normal', 'Tidak normal'] },
                      { label: 'Gigi Mulut', name: 'gigi_mulut', options: ['Normal', 'Tidak normal'] },
                      { label: 'THT', name: 'tht', options: ['Normal', 'Tidak normal'] },
                      { label: 'Dada (Jantung)', name: 'dada_jantung', options: ['Normal', 'Tidak normal'] },
                      { label: 'Dada (Paru)', name: 'dada_paru', options: ['Normal', 'Tidak normal'] },
                      { label: 'Perut', name: 'perut', options: ['Normal', 'Tidak normal'] },
                      { label: 'Tungkai', name: 'tungkai', options: ['Normal', 'Tidak normal'] },
                    ].map((field) => (
                      <div key={field.name} className="flex flex-col gap-1.5 p-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-[10px] font-black text-gray-700 pl-1">{field.label}</span>
                        <div className="flex bg-gray-50 p-0.5 rounded-xl border border-gray-100">
                          {field.options.map((opt) => {
                            const isSel = (docForm as any)[field.name] === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setDocForm(prev => ({ ...prev, [field.name]: opt }))}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                                  isSel ? 'bg-pink-500 text-white shadow-sm font-black' : 'text-gray-400 hover:text-pink-500'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. USG TRIMESTER I */}
                <div className="space-y-4 p-5 bg-pink-50/10 rounded-3xl border border-pink-100/20">
                  <h3 className="text-xs font-black text-pink-700 uppercase tracking-widest flex items-center gap-1.5">
                    📶 USG Trimester I
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* HPHT Date Picker */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">HPHT</label>
                      <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm focus-within:border-pink-300">
                        <button type="button" onClick={() => setIsDocHphtOpen(!isDocHphtOpen)} className="pl-4 pr-1 text-pink-500 shrink-0"><Calendar className="w-4 h-4" /></button>
                        <input 
                          type="text" readOnly value={docForm.hpht ? new Date(docForm.hpht).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pilih Tanggal'} 
                          onClick={() => setIsDocHphtOpen(true)} className="w-full pl-2 pr-4 py-2.5 rounded-2xl text-xs font-bold text-gray-700 bg-transparent cursor-pointer border-none outline-none"
                        />
                        {isDocHphtOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsDocHphtOpen(false)} />
                            <div className="absolute top-full left-0 z-50 mt-2 bg-white rounded-3xl p-4 shadow-xl border border-pink-100 w-[280px]">
                              <div className="flex items-center justify-between mb-4 pb-2 border-b border-pink-50">
                                <button type="button" onClick={handlePrevMonthDocHpht} className="p-1 hover:bg-pink-50 rounded-lg text-pink-500 font-bold">&larr;</button>
                                <span className="text-[9px] font-black text-gray-800 uppercase">{monthsList[calendarDateDocHpht.getMonth()]} {calendarDateDocHpht.getFullYear()}</span>
                                <button type="button" onClick={handleNextMonthDocHpht} className="p-1 hover:bg-pink-50 rounded-lg text-pink-500 font-bold">&rarr;</button>
                              </div>
                              <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: getFirstDayOfMonth(calendarDateDocHpht.getFullYear(), calendarDateDocHpht.getMonth()) }).map((_, i) => <div key={`empty-${i}`} />)}
                                {Array.from({ length: getDaysInMonth(calendarDateDocHpht.getFullYear(), calendarDateDocHpht.getMonth()) }).map((_, i) => {
                                  const dayNum = i + 1;
                                  return (
                                    <button
                                      key={`day-hpht-${dayNum}`} type="button" onClick={() => handleSelectDayDocHpht(dayNum)}
                                      className="py-1 rounded-xl text-center text-xs font-bold hover:bg-pink-50 text-gray-700"
                                    >
                                      {dayNum}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Keteraturan Haid */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Keteraturan Haid</label>
                      <div className="relative">
                        <select 
                          name="keteraturan_haid" 
                          value={docForm.keteraturan_haid} 
                          onChange={handleDocInputChange}
                          className="w-full appearance-none pr-10 px-4 py-2.5 border border-gray-100 bg-white rounded-2xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-pink-100 transition-all"
                        >
                          <option value="Teratur">Teratur</option>
                          <option value="Tidak Teratur">Tidak Teratur</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Usia Kehamilan HPHT */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Usia Kehamilan (HPHT)</label>
                      <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm">
                        <input 
                          type="number" name="usia_kehamilan_hpht_weeks" value={docForm.usia_kehamilan_hpht_weeks} onChange={handleDocInputChange} placeholder="Contoh: 10" 
                          className="w-full px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-700 border-none outline-none bg-transparent"
                        />
                        <span className="absolute right-3 text-[9px] font-black text-pink-500">Minggu</span>
                      </div>
                    </div>

                    {/* HPL Berdasarkan HPHT */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">HPL Berdasarkan HPHT</label>
                      <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm focus-within:border-pink-300">
                        <button type="button" onClick={() => setIsDocHplHphtOpen(!isDocHplHphtOpen)} className="pl-4 pr-1 text-pink-500 shrink-0"><Calendar className="w-4 h-4" /></button>
                        <input 
                          type="text" readOnly value={docForm.hpl_hpht ? new Date(docForm.hpl_hpht).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pilih Tanggal'} 
                          onClick={() => setIsDocHplHphtOpen(true)} className="w-full pl-2 pr-4 py-2.5 rounded-2xl text-xs font-bold text-gray-700 bg-transparent cursor-pointer border-none outline-none"
                        />
                        {isDocHplHphtOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsDocHplHphtOpen(false)} />
                            <div className="absolute top-full left-0 z-50 mt-2 bg-white rounded-3xl p-4 shadow-xl border border-pink-100 w-[280px]">
                              <div className="flex items-center justify-between mb-4 pb-2 border-b border-pink-50">
                                <button type="button" onClick={handlePrevMonthDocHplHpht} className="p-1 hover:bg-pink-50 rounded-lg text-pink-500 font-bold">&larr;</button>
                                <span className="text-[9px] font-black text-gray-800 uppercase">{monthsList[calendarDateDocHplHpht.getMonth()]} {calendarDateDocHplHpht.getFullYear()}</span>
                                <button type="button" onClick={handleNextMonthDocHplHpht} className="p-1 hover:bg-pink-50 rounded-lg text-pink-500 font-bold">&rarr;</button>
                              </div>
                              <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: getFirstDayOfMonth(calendarDateDocHplHpht.getFullYear(), calendarDateDocHplHpht.getMonth()) }).map((_, i) => <div key={`empty-${i}`} />)}
                                {Array.from({ length: getDaysInMonth(calendarDateDocHplHpht.getFullYear(), calendarDateDocHplHpht.getMonth()) }).map((_, i) => (
                                  <button
                                    key={`day-hplhpht-${i+1}`} type="button" onClick={() => handleSelectDayDocHplHpht(i+1)}
                                    className="py-1 rounded-xl text-center text-xs font-bold hover:bg-pink-50 text-gray-700"
                                  >
                                    {i+1}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-gray-100 pt-3">
                    {/* Usia Kehamilan USG */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Usia Kehamilan USG</label>
                      <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm focus-within:border-pink-300">
                        <input 
                          type="number" name="usia_kehamilan_usg_weeks" value={docForm.usia_kehamilan_usg_weeks} onChange={handleDocInputChange} placeholder="Contoh: 9" 
                          className="w-full px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-700 border-none outline-none bg-transparent"
                        />
                        <span className="absolute right-3 text-[9px] font-black text-pink-500">Minggu</span>
                      </div>
                    </div>

                    {/* HPL Berdasarkan USG */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">HPL Berdasarkan USG</label>
                      <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm focus-within:border-pink-300">
                        <button type="button" onClick={() => setIsDocHplUsgOpen(!isDocHplUsgOpen)} className="pl-4 pr-1 text-pink-500 shrink-0"><Calendar className="w-4 h-4" /></button>
                        <input 
                          type="text" readOnly value={docForm.hpl_usg ? new Date(docForm.hpl_usg).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pilih Tanggal'} 
                          onClick={() => setIsDocHplUsgOpen(true)} className="w-full pl-2 pr-4 py-2.5 rounded-2xl text-xs font-bold text-gray-700 bg-transparent cursor-pointer border-none outline-none"
                        />
                        {isDocHplUsgOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsDocHplUsgOpen(false)} />
                            <div className="absolute top-full left-0 z-50 mt-2 bg-white rounded-3xl p-4 shadow-xl border border-pink-100 w-[280px]">
                              <div className="flex items-center justify-between mb-4 pb-2 border-b border-pink-50">
                                <button type="button" onClick={handlePrevMonthDocHplUsg} className="p-1 hover:bg-pink-50 rounded-lg text-pink-500 font-bold">&larr;</button>
                                <span className="text-[9px] font-black text-gray-800 uppercase">{monthsList[calendarDateDocHplUsg.getMonth()]} {calendarDateDocHplUsg.getFullYear()}</span>
                                <button type="button" onClick={handleNextMonthDocHplUsg} className="p-1 hover:bg-pink-50 rounded-lg text-pink-500 font-bold">&rarr;</button>
                              </div>
                              <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: getFirstDayOfMonth(calendarDateDocHplUsg.getFullYear(), calendarDateDocHplUsg.getMonth()) }).map((_, i) => <div key={`empty-${i}`} />)}
                                {Array.from({ length: getDaysInMonth(calendarDateDocHplUsg.getFullYear(), calendarDateDocHplUsg.getMonth()) }).map((_, i) => (
                                  <button
                                    key={`day-hplusg-${i+1}`} type="button" onClick={() => handleSelectDayDocHplUsg(i+1)}
                                    className="py-1 rounded-xl text-center text-xs font-bold hover:bg-pink-50 text-gray-700"
                                  >
                                    {i+1}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. PENGUKURAN GS & CRL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-pink-50/5 p-5 rounded-3xl border border-pink-150/15">
                  
                  {/* GS Panel */}
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="text-[10px] font-black text-pink-600 uppercase tracking-widest">🧫 Kantung Kehamilan (GS)</h4>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 block uppercase">Jumlah GS</label>
                      <div className="relative">
                        <select 
                          name="jumlah_gs" 
                          value={docForm.jumlah_gs} 
                          onChange={handleDocInputChange} 
                          className="w-full appearance-none pr-8 px-3 py-2 border border-gray-50 bg-gray-50 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-1 focus:ring-pink-100 focus:bg-white transition-all"
                        >
                          <option value="Tunggal">Tunggal</option>
                          <option value="Kembar">Kembar</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 block uppercase">Diameter GS (cm)</label>
                      <input type="number" step="0.01" name="diameter_gs" value={docForm.diameter_gs} onChange={handleDocInputChange} placeholder="e.g. 1.25" className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 shadow-inner" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8px] font-black text-gray-400 block uppercase">Weeks</label>
                        <input type="number" name="diameter_gs_weeks" value={docForm.diameter_gs_weeks} onChange={handleDocInputChange} placeholder="Weeks" className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs font-bold" />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-gray-400 block uppercase">Days</label>
                        <input type="number" name="diameter_gs_days" value={docForm.diameter_gs_days} onChange={handleDocInputChange} placeholder="Days" className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs font-bold" />
                      </div>
                    </div>
                  </div>

                  {/* CRL Panel */}
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="text-[10px] font-black text-pink-600 uppercase tracking-widest">👶 Embrio / Janin (CRL)</h4>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 block uppercase">Jumlah Bayi</label>
                      <div className="relative">
                        <select 
                          name="jumlah_bayi" 
                          value={docForm.jumlah_bayi} 
                          onChange={handleDocInputChange} 
                          className="w-full appearance-none pr-8 px-3 py-2 border border-gray-50 bg-gray-50 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-1 focus:ring-pink-100 focus:bg-white transition-all"
                        >
                          <option value="Tunggal">Tunggal</option>
                          <option value="Kembar">Kembar</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 block uppercase">Panjang CRL (cm)</label>
                      <input type="number" step="0.01" name="crl" value={docForm.crl} onChange={handleDocInputChange} placeholder="e.g. 2.40" className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 shadow-inner" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8px] font-black text-gray-400 block uppercase">Weeks</label>
                        <input type="number" name="crl_weeks" value={docForm.crl_weeks} onChange={handleDocInputChange} placeholder="Weeks" className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs font-bold" />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-gray-400 block uppercase">Days</label>
                        <input type="number" name="crl_days" value={docForm.crl_days} onChange={handleDocInputChange} placeholder="Days" className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs font-bold" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Letak, Pulsasi & Abnormalitas */}
                <div className="space-y-4 p-5 bg-gray-50/50 rounded-3xl border border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-white p-3 rounded-2xl border border-gray-100">
                      <label className="text-[9px] font-black text-gray-455 uppercase block tracking-wider">Letak Kehamilan</label>
                      <div className="relative">
                        <select 
                          name="letak_kehamilan" 
                          value={docForm.letak_kehamilan} 
                          onChange={handleDocInputChange} 
                          className="w-full appearance-none pr-8 py-1.5 px-2 bg-gray-50 border border-gray-50 rounded-lg text-xs font-bold text-gray-700 outline-none focus:ring-1 focus:ring-pink-100 focus:bg-white transition-all"
                        >
                          <option value="Intrauterin">Intrauterin</option>
                          <option value="Extrauterin">Extrauterin</option>
                          <option value="Tidak dapat ditentukan">Tidak dapat ditentukan</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 bg-white p-3 rounded-2xl border border-gray-100">
                      <label className="text-[9px] font-black text-gray-455 uppercase block tracking-wider">Denyut / Pulsasi Jantung</label>
                      <div className="relative">
                        <select 
                          name="pulsasi_jantung" 
                          value={docForm.pulsasi_jantung} 
                          onChange={handleDocInputChange} 
                          className="w-full appearance-none pr-8 py-1.5 px-2 bg-gray-50 border border-gray-50 rounded-lg text-xs font-bold text-gray-700 outline-none focus:ring-1 focus:ring-pink-100 focus:bg-white transition-all"
                        >
                          <option value="Tampak">Tampak (Tampak Jelas)</option>
                          <option value="Tidak tampak">Tidak tampak</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-black text-gray-455 uppercase block tracking-wider">Kecurigaan Temuan Abnormal</label>
                      <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-100 w-24">
                        {['Tidak', 'Ya'].map(opt => (
                          <button
                            key={opt} type="button" onClick={() => setDocForm(prev => ({ ...prev, kecurigaan_abnormal: opt }))}
                            className={`flex-1 py-1 rounded text-[9px] font-black transition-all ${docForm.kecurigaan_abnormal === opt ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-400'}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {docForm.kecurigaan_abnormal === 'Ya' && (
                      <textarea
                        name="kecurigaan_abnormal_detail" value={docForm.kecurigaan_abnormal_detail} onChange={handleDocInputChange}
                        placeholder="Sebutkan detail kecurigaan temuan abnormal..." rows={3}
                        className="w-full p-3 border border-pink-100 rounded-xl text-xs font-bold text-gray-700 focus:ring-2 focus:ring-pink-100 outline-none transition-all animate-in slide-in-from-top-2"
                      />
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-pink-500 text-white font-extrabold py-4 px-6 rounded-3xl shadow-lg hover:bg-pink-600 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider animate-pulse"
                >
                  {isSubmitting ? 'Menyimpan USG...' : 'Simpan USG & Hasil Dokter'}
                  <Save className="w-4 h-4" />
                </button>

              </form>
            </div>
          )}

          {/* VIEW 3: HISTORI PEMERIKSAAN */}
          {currentView === 'histori' && (
            <div className="bg-white rounded-[36px] shadow-sm border border-pink-100 overflow-hidden p-6 md:p-8 animate-in fade-in duration-300">
              <div className="mb-6 pb-4 border-b border-gray-150">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-black text-gray-900">Histori Pemeriksaan</h2>
                    <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                      Rekam Medis Kebidanan KIA & USG Dokter
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-tab Selection for History Type (Full width, spacious layout) */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row bg-gray-50/50 p-2 rounded-[24px] border border-gray-100 gap-2 shadow-sm w-full">
                  <button
                    type="button"
                    onClick={() => setHistoryTab('midwife')}
                    className={`flex-1 py-3.5 px-6 rounded-[18px] text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                      historyTab === 'midwife' 
                        ? 'bg-white text-pink-600 border border-pink-100/50' 
                        : 'text-gray-400 hover:text-pink-500 hover:bg-white/50 border border-transparent'
                    }`}
                  >
                    <Heart className="w-4 h-4" /> Bidan ({checkups.length} Catatan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryTab('doctor')}
                    className={`flex-1 py-3.5 px-6 rounded-[18px] text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                      historyTab === 'doctor' 
                        ? 'bg-white text-pink-600 border border-pink-100/50' 
                        : 'text-gray-400 hover:text-pink-500 hover:bg-white/50 border border-transparent'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4" /> USG ({doctorCheckups.length} Catatan)
                  </button>
                </div>
              </div>

              {historyTab === 'midwife' ? (
                /* MIDWIFE HISTORY TIMELINE */
                checkups.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[32px] space-y-4">
                    <div className="h-16 w-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto text-pink-400">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-base">Belum Ada Pemeriksaan Bidan</h3>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                    {checkups.slice().reverse().map((checkup) => (
                      <div key={checkup.id} className="bg-white hover:bg-gray-50/50 p-5 rounded-[28px] border border-gray-100 transition-all flex flex-col sm:flex-row justify-between items-start gap-4 shadow-sm">
                        <div className="space-y-4 w-full">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-50 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="h-8 w-8 bg-pink-50 text-pink-500 rounded-lg flex items-center justify-center font-black text-xs">{checkup.week}</span>
                              <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Usia Kehamilan</h4>
                                <p className="text-sm font-extrabold text-gray-800">{checkup.week} Minggu</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100/50 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {new Date(checkup.checkup_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 bg-blue-50/30 rounded-2xl border border-blue-100/20">
                              <span className="text-[9px] font-black text-blue-500 uppercase block">HB</span>
                              <span className="text-sm font-extrabold text-gray-800 block truncate mt-0.5">{checkup.hb} g/dL</span>
                              <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded-full mt-1.5 ${checkup.hb_status === 'Normal' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-650'}`}>{checkup.hb_status}</span>
                            </div>
                            <div className="p-3 bg-rose-50/30 rounded-2xl border border-rose-100/20">
                              <span className="text-[9px] font-black text-rose-500 uppercase block">Tensi</span>
                              <span className="text-sm font-extrabold text-gray-800 block truncate mt-0.5">{checkup.tekanan_darah}</span>
                              <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded-full mt-1.5 ${checkup.tekanan_darah_status === 'Normal' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{checkup.tekanan_darah_status}</span>
                            </div>
                            <div className="p-3 bg-amber-50/30 rounded-2xl border border-amber-100/20">
                              <span className="text-[9px] font-black text-amber-500 uppercase block">TFU</span>
                              <span className="text-sm font-extrabold text-gray-850 block truncate mt-0.5">{checkup.tfu} cm</span>
                              <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded-full mt-1.5 ${checkup.tfu_status === 'Sesuai' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>{checkup.tfu_status}</span>
                            </div>
                            <div className="p-3 bg-emerald-50/30 rounded-2xl border border-emerald-100/20">
                              <span className="text-[9px] font-black text-emerald-500 uppercase block">DJJ</span>
                              <span className="text-sm font-extrabold text-gray-800 block truncate mt-0.5">{checkup.djj} bpm</span>
                              <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded-full mt-1.5 ${checkup.djj_status === 'Baik' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-650'}`}>{checkup.djj_status}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100/50">
                            <Scale className="w-3.5 h-3.5 text-gray-400" />
                            <span>Berat Badan Ibu: <strong className="text-gray-700">{checkup.weight || '-'} kg</strong></span>
                          </div>
                        </div>

                        <button onClick={() => handleDeleteCheckup(checkup.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all self-end sm:self-center shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* DOCTOR / USG HISTORY TIMELINE */
                doctorCheckups.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[32px] space-y-4">
                    <div className="h-16 w-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto text-pink-400">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-base">Belum Ada Rekam USG Dokter</h3>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                    {doctorCheckups.slice().reverse().map((dc) => (
                      <div key={dc.id} className="bg-white hover:bg-gray-50/50 p-5 rounded-[28px] border border-gray-100 transition-all flex flex-col justify-between gap-4 shadow-sm">
                        
                        {/* Title Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-50 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="h-8 w-8 bg-pink-50 text-pink-500 rounded-lg flex items-center justify-center font-black text-xs">
                              {dc.usia_kehamilan_usg_weeks || dc.usia_kehamilan_hpht_weeks || '?'}
                            </span>
                            <div>
                              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Gestasi USG</h4>
                              <p className="text-sm font-extrabold text-gray-800">{dc.usia_kehamilan_usg_weeks ? `${dc.usia_kehamilan_usg_weeks} Minggu` : 'Tidak Diukur'}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100/50 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(dc.checkup_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>

                        {/* Doctor's Name & Status */}
                        <div className="flex justify-between items-center bg-pink-50/10 p-3 rounded-2xl border border-pink-100/20 text-xs font-bold">
                          <span className="text-gray-500">Oleh: <strong className="text-gray-800">{dc.dokter_name}</strong></span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${dc.konsep === 'Normal' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-650'}`}>
                            {dc.konsep === 'Normal' ? 'Normal' : 'Bermasalah'}
                          </span>
                        </div>

                        {/* USG parameters display */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                            <span className="text-[9px] font-black text-pink-600 uppercase block">GS (Kantung)</span>
                            <p className="font-extrabold text-gray-850 mt-0.5">Diameter: {dc.diameter_gs || '0.00'} cm</p>
                            <p className="text-[10px] text-gray-500">Gestasi: {dc.diameter_gs_weeks}m + {dc.diameter_gs_days}h ({dc.jumlah_gs})</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                            <span className="text-[9px] font-black text-pink-600 uppercase block">CRL (Janin)</span>
                            <p className="font-extrabold text-gray-850 mt-0.5">Panjang: {dc.crl || '0.00'} cm</p>
                            <p className="text-[10px] text-gray-500">Gestasi: {dc.crl_weeks}m + {dc.crl_days}h ({dc.jumlah_bayi})</p>
                          </div>
                        </div>

                        {/* Rahim/Klinis janin summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-black uppercase text-center">
                          <span className="bg-blue-50 text-blue-700 py-2 px-3 rounded-xl border border-blue-100/50 block truncate">Letak: {dc.letak_kehamilan}</span>
                          <span className="bg-emerald-50 text-emerald-700 py-2 px-3 rounded-xl border border-emerald-100/50 block truncate">Jantung: {dc.pulsasi_jantung}</span>
                          <span className={`py-2 px-3 rounded-xl border block truncate ${dc.kecurigaan_abnormal === 'Ya' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>Abnormal: {dc.kecurigaan_abnormal}</span>
                        </div>

                        {dc.kecurigaan_abnormal === 'Ya' && dc.kecurigaan_abnormal_detail && (
                          <div className="bg-red-50/30 p-3 rounded-2xl border border-red-150/15 text-xs text-red-700 font-bold flex items-start gap-1.5">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <span>Detail Abnormal: {dc.kecurigaan_abnormal_detail}</span>
                          </div>
                        )}

                        {/* Physical Exam Summary */}
                        <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100/80 text-[10px] font-bold text-gray-500 space-y-1">
                          <p className="text-gray-400 uppercase tracking-widest text-[8px] font-black">Hasil Pemeriksaan Fisik</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[9px]">
                            <span>Konjungtiva: <strong className="text-gray-700">{dc.konjungtiva}</strong></span>
                            <span>Sklera: <strong className="text-gray-700">{dc.sklera}</strong></span>
                            <span>Kulit: <strong className="text-gray-700">{dc.kulit}</strong></span>
                            <span>Leher: <strong className="text-gray-700">{dc.leher}</strong></span>
                            <span>Gigi/Mulut: <strong className="text-gray-700">{dc.gigi_mulut}</strong></span>
                            <span>THT: <strong className="text-gray-700">{dc.tht}</strong></span>
                            <span>Dada Jantung: <strong className="text-gray-700">{dc.dada_jantung}</strong></span>
                            <span>Dada Paru: <strong className="text-gray-700">{dc.dada_paru}</strong></span>
                          </div>
                        </div>

                        {/* Delete Action Button */}
                        <button 
                          onClick={() => handleDeleteDocCheckup(dc.id)} 
                          className="self-end p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
