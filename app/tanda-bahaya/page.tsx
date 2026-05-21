"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Check, 
  X, 
  AlertCircle, 
  Phone, 
  Activity, 
  Heart, 
  Sparkles,
  Info,
  Smile,
  Compass,
  Zap,
  HelpCircle,
  Gamepad2,
  Lightbulb,
  Ban,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Trimester 1 danger signs
const trimester1Danger = [
  {
    title: "Demam Tinggi",
    desc: "Suhu tubuh Ibu terasa sangat panas. Demam tinggi di trimester awal bisa mengganggu pembentukan organ bayi.",
    speech: "Demam Tinggi. Suhu tubuh Ibu sangat panas. Segera periksa ke bidan atau puskesmas terdekat agar mendapat obat penurun demam yang aman untuk janin.",
    severity: "high"
  },
  {
    title: "Nyeri Perut Hebat",
    desc: "Perut bagian bawah melilit kencang, perih, dan sangat sakit. Ini bisa menjadi tanda awal keguguran.",
    speech: "Nyeri Perut Hebat. Perut melilit kencang dan sangat sakit. Jangan diurut! Segera periksa ke puskesmas atau rumah sakit.",
    severity: "high"
  },
  {
    title: "Mual & Muntah Hebat",
    desc: "Ibu muntah terus-menerus dan sama sekali tidak bisa makan nasi atau minum air. Tubuh menjadi sangat lemas.",
    speech: "Mual dan Muntah Hebat. Ibu muntah terus-menerus hingga tidak bisa makan dan minum sama sekali. Tubuh lemas dan kekurangan cairan berbahaya bagi janin.",
    severity: "medium"
  },
  {
    title: "Perdarahan",
    desc: "Keluar darah dari jalan lahir, baik berupa flek kecokelatan maupun darah merah segar mengalir.",
    speech: "Perdarahan. Keluar flek atau darah dari jalan lahir merupakan tanda bahaya besar di trimester awal kehamilan. Segera tiduran dan hubungi bidan.",
    severity: "high"
  },
  {
    title: "Sakit Pipis & Keputihan Gatal",
    desc: "Perih saat buang air kecil atau keputihan yang berbau menyengat, berwarna kehijauan, dan terasa gatal di area kemaluan.",
    speech: "Sakit saat buang air kecil atau keputihan gatal. Ini menandakan adanya infeksi bakteri yang harus diobati agar tidak merambat ke rahim.",
    severity: "medium"
  },
  {
    title: "Batuk Lama & Malaria",
    desc: "Batuk terus-menerus lebih dari 2 minggu, demam menggigil di daerah endemis malaria, atau diare berulang.",
    speech: "Batuk lama lebih dari dua minggu, demam menggigil, atau diare berulang. Segera minta pemeriksaan laboratorium di puskesmas.",
    severity: "medium"
  }
];

// Trimester 2 danger signs
const trimester2Danger = [
  {
    title: "Demam Tinggi",
    desc: "Panas tinggi pada tubuh yang tidak kunjung turun setelah diistirahatkan.",
    speech: "Demam Tinggi. Tubuh ibu sangat panas. Hal ini bisa memicu kontraksi dini pada rahim.",
    severity: "high"
  },
  {
    title: "Muntah Darah",
    desc: "Muntah hebat disertai bercak darah atau cairan berwarna gelap dari lambung.",
    speech: "Muntah Darah. Ibu mengalami muntah bercampur darah. Segera ke instalasi gawat darurat rumah sakit terdekat.",
    severity: "high"
  },
  {
    title: "Napas Pendek & Dada Berdebar",
    desc: "Ibu merasa sesak napas saat berjalan santai atau jantung berdetak sangat kencang tanpa sebab.",
    speech: "Napas pendek dan dada berdebar kencang. Menunjukkan beban jantung berlebihan atau kurangnya hemoglobin darah.",
    severity: "medium"
  },
  {
    title: "Nyeri Perut Hebat",
    desc: "Rasa nyeri menekan di bagian bawah perut yang menetap dan tidak hilang saat berbaring.",
    speech: "Nyeri Perut Hebat. Perut kencang dan sakit terus-menerus. Waspadai robekan plasenta atau gangguan rahim.",
    severity: "high"
  },
  {
    title: "Pandangan Kabur",
    desc: "Penglihatan mendadak buram, berkunang-kunang, disertai sakit kepala hebat di bagian belakang.",
    speech: "Pandangan Kabur. Mata mendadak buram disertai sakit kepala hebat. Ini tanda utama keracunan kehamilan atau preeklampsia.",
    severity: "high"
  },
  {
    title: "Perdarahan & Air Ketuban Berbau",
    desc: "Keluar darah segar atau cairan merembes basah dari jalan lahir yang baunya tidak sedap.",
    speech: "Perdarahan atau air ketuban merembes berbau dari jalan lahir. Menandakan infeksi selaput ketuban atau plasenta lepas.",
    severity: "high"
  }
];

// Trimester 3 danger signs
const trimester3Danger = [
  {
    title: "Gerakan Bayi Berkurang",
    desc: "Bayi bergerak kurang dari 10 kali dalam kurun waktu 12 jam. Bayi terasa tidak aktif seperti biasanya.",
    speech: "Gerakan Bayi Berkurang. Bayi di dalam perut harus bergerak minimal sepuluh kali dalam dua belas jam. Jika kurang, segera rangsang dengan minum air dingin atau elus perut. Jika tetap diam, segera ke rumah sakit.",
    severity: "high"
  },
  {
    title: "Ketuban Pecah Dini",
    desc: "Keluar cairan bening seperti air pipis dalam jumlah banyak secara tiba-tiba tanpa rasa mulas.",
    speech: "Ketuban Pecah Dini. Keluar air bening seperti kencing mengalir basah tanpa rasa mulas. Bayi harus segera dilahirkan untuk mencegah infeksi fatal.",
    severity: "high"
  },
  {
    title: "Nyeri Perut Hebat di Antara Mulas",
    desc: "Perut terasa sangat keras seperti papan dan sakit luar biasa di sela-sela jeda kontraksi.",
    speech: "Nyeri perut hebat di antara mulas. Perut terasa keras seperti papan terus-menerus. Kondisi darurat plasenta lepas.",
    severity: "high"
  },
  {
    title: "Perdarahan Hebat",
    desc: "Keluar darah merah segar dalam jumlah banyak seperti menstruasi hari pertama.",
    speech: "Perdarahan hebat. Segera bawa ke rumah sakit terdekat dengan posisi berbaring agar tidak kekurangan darah.",
    severity: "high"
  },
  {
    title: "Pusing Kepala Berat",
    desc: "Sakit kepala luar biasa yang tidak reda dengan istirahat atau minum air putih.",
    speech: "Pusing kepala sangat berat disertai bengkak di tangan dan muka. Segera periksa tensi darah untuk mencegah kejang kehamilan.",
    severity: "high"
  }
];

// Daily habits game cards
const dailyHabitsGame = [
  {
    id: 1,
    title: "Minum Obat Tanpa Resep",
    desc: "Minum obat pusing atau pegal-pegal yang dibeli sendiri di warung/toko obat tanpa resep dari Dokter atau Bidan.",
    isProhibited: true,
    speech: "Minum obat tanpa resep dokter sangat dilarang. Zat kimia obat warung bisa mengalir ke plasenta dan merusak perkembangan ginjal serta jantung janin.",
    tip: "Mintalah obat penurun panas atau pereda nyeri hanya dari bidan atau dokter puskesmas."
  },
  {
    id: 2,
    title: "Aktivitas Berat & Lelah",
    desc: "Mengangkat barang berat seperti ember air penuh, menaiki tangga tinggi berulang kali, atau bekerja hingga tubuh kelelahan.",
    isProhibited: true,
    speech: "Aktivitas berat yang membuat lelah dilarang bagi ibu hamil karena memicu tekanan rahim dan menyebabkan keguguran atau lahir prematur.",
    tip: "Bagilah pekerjaan rumah tangga dengan suami. Istirahatlah ketika tubuh mulai terasa lelah."
  },
  {
    id: 3,
    title: "Merokok / Kena Asap Rokok",
    desc: "Menghirup asap rokok dari orang lain di sekitar (perokok pasif) atau merokok aktif.",
    isProhibited: true,
    speech: "Merokok atau terkena asap rokok sangat berbahaya. Racun asap rokok merusak pembuluh darah plasenta sehingga bayi lahir dengan berat badan rendah.",
    tip: "Minta suami atau anggota keluarga lain untuk merokok di luar rumah dan menjauh dari Ibu."
  },
  {
    id: 4,
    title: "Minum Jamu Tradisional & Alkohol",
    desc: "Minum jamu racikan tradisional yang tidak terdaftar BPOM atau minuman yang mengandung alkohol.",
    isProhibited: true,
    speech: "Minum jamu racikan tradisional dan alkohol dilarang keras. Jamu racikan seringkali merusak fungsi hati dan ginjal janin.",
    tip: "Cukup konsumsi vitamin kehamilan dan tablet tambah darah dari bidan."
  },
  {
    id: 5,
    title: "Tidur Telentang >10 Menit di Trimester 2 & 3",
    desc: "Berbaring terlentang lurus dengan posisi dada menghadap ke atas dalam waktu yang lama.",
    isProhibited: true,
    speech: "Tidur terlentang lebih dari sepuluh menit pada trimester dua dan tiga dilarang. Rahim yang berat akan menindih pembuluh darah utama ibu, sehingga aliran darah dan oksigen ke otak bayi berkurang drastis.",
    tip: "Tidurlah dengan posisi miring ke kiri untuk memaksimalkan pasokan oksigen bagi janin."
  },
  {
    id: 6,
    title: "Mengajak Bicara Bayi dalam Kandungan",
    desc: "Sering mengelus perut dan mengajak janin mengobrol atau mendengarkan musik lembut.",
    isProhibited: false,
    speech: "Sangat dianjurkan. Pendengaran janin mulai aktif sejak usia lima bulan. Berbicara dengan bayi merangsang pertumbuhan sel otaknya sejak dalam kandungan.",
    tip: "Suami juga dianjurkan sering mengajak bayi mengobrol agar bayi mengenali suara ayahnya."
  },
  {
    id: 7,
    title: "Olahraga Senam Ringan",
    desc: "Melakukan pemanasan, peregangan otot, senam panggul, atau jalan santai di pagi hari.",
    isProhibited: false,
    speech: "Sangat boleh dan dianjurkan. Olahraga ringan melatih kelenturan panggul dan melancarkan persalinan.",
    tip: "Lakukan senam hamil secara rutin didampingi suami atau bidan."
  }
];

// Prohibited physical activities
const physicalRestrictions = [
  { title: "Jongkok Terlalu Lama", desc: "Menekan rahim terlalu lama, memicu kontraksi dini." },
  { title: "Melompat", desc: "Guncangan keras membahayakan posisi janin di rahim." },
  { title: "Bersepeda / Risiko Keseimbangan", desc: "Risiko terjatuh yang bisa berakibat fatal bagi plasenta." },
  { title: "Membungkuk Tanpa Pegangan", desc: "Beban punggung berlebih memicu ketegangan otot perut." },
  { title: "Mengejan Keras", desc: "Tekanan berlebihan pada panggul memicu ketuban pecah dini." }
];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 150 : -150,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (dir: number) => ({
    x: dir < 0 ? 150 : -150,
    opacity: 0
  })
};

export default function TandaBahayaPage() {
  const [activeTrimester, setActiveTrimester] = useState(1);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [gameState, setGameState] = useState<{ [key: number]: 'correct' | 'wrong' | null }>({});
  const [scores, setScores] = useState({ correct: 0, total: 0 });
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Handle TTS
  const playSpeech = (text: string, title: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (speaking === title) {
        window.speechSynthesis.cancel();
        setSpeaking(null);
        return;
      }
      window.speechSynthesis.cancel();
      setSpeaking(title);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
      if (idVoice) {
        utterance.voice = idVoice;
      }
      
      utterance.onend = () => {
        setSpeaking(null);
      };
      utterance.onerror = () => {
        setSpeaking(null);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleGameAnswer = (habitId: number, isProhibited: boolean, userAnswer: boolean) => {
    if (gameState[habitId] !== undefined) return; // Answered already
    
    const isCorrect = (isProhibited === userAnswer);
    setGameState(prev => ({ ...prev, [habitId]: isCorrect ? 'correct' : 'wrong' }));
    setScores(prev => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      total: prev.total + 1
    }));

    // Trigger Indonesian narration for the answer
    const habit = dailyHabitsGame.find(h => h.id === habitId);
    if (habit) {
      const resultText = isCorrect 
        ? `Jawaban Anda Benar! ${habit.speech}` 
        : `Jawaban Anda Belum Tepat. ${habit.speech}`;
      playSpeech(resultText, `game-${habitId}`);
    }
  };

  const getActiveTrimesterData = () => {
    switch (activeTrimester) {
      case 1: return trimester1Danger;
      case 2: return trimester2Danger;
      case 3: return trimester3Danger;
      default: return trimester1Danger;
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/40 font-sans pb-24 selection:bg-rose-200">
      
      {/* HEADER SECTION */}
      <header className="bg-white border-b border-rose-100 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link 
            href="/dashboard/bumil" 
            className="h-10 w-10 bg-white border border-gray-150 rounded-xl flex items-center justify-center hover:bg-gray-50 text-gray-500 hover:text-pink-500 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-red-500 w-6 h-6 animate-pulse" />
            <h1 className="text-sm sm:text-lg font-black text-gray-900 tracking-tight uppercase">Buku Saku Digital Tanda Bahaya</h1>
          </div>
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        
        {/* INTERACTIVE SPEECH PROMPT BANNER FOR THE TECH-ILLITERATE */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-[32px] p-6 sm:p-8 text-white shadow-xl shadow-red-200 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
            <ShieldAlert className="w-64 h-64" />
          </div>
          <div className="space-y-3 relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Volume2 className="w-3.5 h-3.5" /> Panduan Suara Aktif
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
              Malas Membaca? <br className="hidden sm:inline" />Tinggal Klik Tombol Speaker Saja!
            </h2>
            <p className="text-xs sm:text-sm text-red-50 font-bold max-w-xl">
              Kami merancang halaman ini sangat ramah untuk ibu hamil. Cukup tekan ikon speaker merah muda di samping tulisan, maka handphone akan membacakan informasinya untuk Anda secara langsung.
            </p>
          </div>
          <button
            onClick={() => playSpeech("Halo Ibu Hamil! Halaman ini adalah Buku Saku Tanda Bahaya Kehamilan. Jika Ibu malas membaca, silakan klik tombol speaker berwarna merah muda pada setiap bagian untuk mendengarkan panduan suara kami.", "intro")}
            className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center shadow-lg transition-all scale-105 active:scale-95 text-xl relative shrink-0 ${
              speaking === "intro" 
                ? 'bg-white text-red-500 animate-pulse border-4 border-red-300' 
                : 'bg-white/10 hover:bg-white/20 border-2 border-white text-white'
            }`}
          >
            {speaking === "intro" ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
          </button>
        </div>

        {/* SECTION 1: DANGER SIGNS BY TRIMESTER */}
        <section className="bg-white rounded-[40px] border border-rose-100 p-6 sm:p-8 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-50 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">EDUKASI KIA</span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                <ShieldAlert className="text-red-500 w-6 h-6 shrink-0" /> Tanda Bahaya Berdasarkan Trimester
              </h3>
            </div>
            <button
              onClick={() => playSpeech("Bagian ini menampilkan tanda-tanda bahaya kehamilan. Silakan pilih Trimester satu, dua, atau tiga menggunakan tombol yang disediakan, lalu dengarkan penjelasan setiap tanda bahayanya.", "instruction-trimester")}
              className="text-pink-500 hover:text-pink-600 flex items-center gap-1 text-xs font-bold bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100/50 self-start sm:self-auto"
            >
              <Volume2 className="w-3.5 h-3.5" /> Cara Memakai
            </button>
          </div>

          {/* TRIMESTER SWITCHER TAB (FULL WIDTH PREMIUM) */}
          <div className="flex bg-gray-50/50 p-2 rounded-[24px] border border-gray-150 gap-2 shadow-sm w-full">
            {[1, 2, 3].map((tri) => (
              <button
                key={tri}
                onClick={() => {
                  setActiveTrimester(tri);
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    setSpeaking(null);
                  }
                }}
                className={`flex-1 py-4 px-3 sm:px-6 rounded-[18px] text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 shadow-sm ${
                  activeTrimester === tri 
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-pink-500 hover:bg-white/50 border border-transparent'
                }`}
              >
                <Activity className="w-4 h-4 shrink-0" />
                <span className="text-center">Trimester {tri}</span>
              </button>
            ))}
          </div>

          {/* DANGER CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getActiveTrimesterData().map((danger, idx) => (
              <div 
                key={idx}
                className="bg-red-50/15 hover:bg-red-50/30 rounded-[32px] border border-red-100/40 p-5 flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-lg relative overflow-hidden"
              >
                {/* Severity pill */}
                <div className="flex items-center justify-between mb-4 gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    danger.severity === 'high' ? 'bg-red-100 text-red-650' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <span className="flex items-center gap-1">
                      {danger.severity === 'high' ? (
                        <>
                          <ShieldAlert className="w-3 h-3 text-red-600 shrink-0" /> BAHAYA BESAR
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" /> PANTAU KETAT
                        </>
                      )}
                    </span>
                  </span>
                  <button
                    onClick={() => playSpeech(danger.speech, danger.title)}
                    className={`h-9 w-9 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all ${
                      speaking === danger.title ? 'bg-red-500 text-white animate-pulse' : 'bg-pink-100 text-pink-650 hover:bg-pink-200'
                    }`}
                    title="Dengarkan Suara"
                  >
                    {speaking === danger.title ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm sm:text-base font-black text-gray-800 leading-tight">{danger.title}</h4>
                  <p className="text-xs text-gray-700 leading-relaxed font-bold">{danger.desc}</p>
                </div>

                {/* Voice guide indicator */}
                <div className="mt-4 pt-3 border-t border-red-100/30 flex items-center gap-1 text-[9px] font-black text-pink-500 uppercase tracking-widest">
                  <Volume2 className="w-3 h-3" /> Klik Speaker di Atas
                </div>
              </div>
            ))}
          </div>

          <div className="bg-red-50 text-red-750 p-5 rounded-3xl border border-red-100/60 flex gap-4 items-start">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-red-500" />
            <div className="space-y-1.5 text-xs font-bold">
              <p className="uppercase font-black text-red-800 tracking-wider">PENTING BAGI IBU & SUAMI:</p>
              <p className="leading-relaxed text-pink-700">
                Jika Ibu mengalami salah satu atau beberapa tanda bahaya di atas, <span className='font-bold text-red-500'>JANGAN MENUNDA!</span> Jangan diberi ramuan tradisional atau dipijat. Segera bawa Ibu hamil ke Puskesmas, Rumah Sakit, atau hubungi Bidan siaga secepatnya. Nyawa Ibu dan Bayi adalah prioritas utama.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: INTERACTIVE "BOLEH VS TIDAK BOLEH" HABITS GAME */}
        <section className="bg-white rounded-[40px] border border-rose-100 p-6 sm:p-8 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-50 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest block">PERMAINAN INTERAKTIF</span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                <Gamepad2 className="text-pink-500 w-6 h-6 shrink-0 animate-bounce" /> Boleh atau Tidak Boleh? (Game Kebiasaan Bumil)
              </h3>
            </div>
            <button
              onClick={() => playSpeech("Ayo bermain kuis kebiasaan hamil! Silakan pilih apakah kegiatan berikut Boleh atau Tidak Boleh dilakukan oleh Ibu selama hamil. Klik salah satu tombol di bawah setiap kartu untuk melihat jawabannya dan mendengarkan penjelasan dokter.", "instruction-game")}
              className="text-pink-500 hover:text-pink-600 flex items-center gap-1 text-xs font-bold bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100/50 self-start sm:self-auto"
            >
              <Volume2 className="w-3.5 h-3.5" /> Cara Bermain
            </button>
          </div>

          <div className="bg-pink-50/50 p-4 rounded-3xl border border-pink-100/30 flex items-center justify-between gap-4">
            <p className="text-xs font-bold text-gray-600">
              Uji pengetahuan kehamilan Ibu di sini! Tebak mana yang aman dan mana yang berbahaya.
            </p>
            {scores.total > 0 && (
              <span className="px-4 py-1.5 bg-pink-500 text-white rounded-full text-xs font-black uppercase tracking-wider shrink-0 shadow-sm">
                Skor Anda: {scores.correct}/{scores.total}
              </span>
            )}
          </div>

          {/* GAME CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dailyHabitsGame.map((habit) => {
              const result = gameState[habit.id];
              return (
                <div 
                  key={habit.id}
                  className={`p-6 rounded-[36px] border transition-all flex flex-col justify-between space-y-6 ${
                    result === 'correct' 
                      ? 'bg-green-50/30 border-green-200' 
                      : result === 'wrong' 
                        ? 'bg-red-50/30 border-red-200' 
                        : 'bg-gray-50/60 border-gray-100 hover:bg-white hover:shadow-lg'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center gap-2">
                      <span className="h-8 w-8 bg-pink-100 text-pink-500 rounded-xl flex items-center justify-center font-black text-xs">
                        {habit.id}
                      </span>
                      <button
                        onClick={() => playSpeech(habit.speech, `speech-game-${habit.id}`)}
                        className={`h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${
                          speaking === `speech-game-${habit.id}` ? 'bg-red-500 text-white animate-pulse' : 'bg-pink-50 text-pink-600'
                        }`}
                        title="Dengarkan Suara Penjelasan"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="text-sm sm:text-base font-black text-gray-800 leading-tight">{habit.title}</h4>
                    <p className="text-xs text-gray-700 leading-relaxed font-bold">{habit.desc}</p>
                  </div>

                  {/* GAME CONTROLS / RESULT VIEW */}
                  <div className="pt-4 border-t border-gray-100/60">
                    <AnimatePresence mode="wait">
                      {result === null || result === undefined ? (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleGameAnswer(habit.id, habit.isProhibited, false)}
                            className="flex-1 bg-green-500 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all hover:bg-green-600"
                          >
                            <Check className="w-4 h-4" /> Boleh (Aman)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGameAnswer(habit.id, habit.isProhibited, true)}
                            className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all hover:bg-red-600"
                          >
                            <X className="w-4 h-4" /> Dilarang
                          </button>
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <div className={`flex items-center gap-2 text-xs font-black uppercase ${
                            result === 'correct' ? 'text-green-600' : 'text-red-650'
                          }`}>
                            {result === 'correct' ? (
                              <><Check className="w-4 h-4 shrink-0" /> Jawaban Anda Benar!</>
                            ) : (
                              <><X className="w-4 h-4 shrink-0" /> Jawaban Anda Kurang Tepat!</>
                            )}
                          </div>
                          
                          <div className={`p-4 rounded-2xl text-xs font-bold border leading-relaxed ${
                            habit.isProhibited 
                              ? 'bg-red-50/50 text-red-750 border-red-100' 
                              : 'bg-green-50/50 text-green-750 border-green-100'
                          }`}>
                            <p className="font-black text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Info className="w-3.5 h-3.5 text-gray-600" /> <span className="text-gray-500">Mengapa Demikian?</span>
                            </p>
                            <p className="text-gray-700">{habit.speech}</p>
                            <p className="mt-2 text-[10px] font-black text-gray-500 border-t border-dashed pt-1.5 flex items-center gap-1">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" /> TIP MEDIS: {habit.tip}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: PHYSICAL RESTRICTIONS (Spacious Interactive Carousel) */}
        <section className="bg-white rounded-[40px] border border-rose-100 p-6 sm:p-8 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-50 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest block">BATASAN AKTIVITAS</span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                <Ban className="text-red-500 w-6 h-6 shrink-0" /> Aktivitas Fisik yang Tidak Boleh Dilakukan
              </h3>
            </div>
            <button
              onClick={() => playSpeech("Bagian ini menampilkan lima aktivitas fisik yang dilarang bagi ibu hamil secara bergantian. Gunakan tombol panah kiri atau kanan di bagian bawah kartu untuk menggeser dan melihat aktivitas lainnya secara interaktif. Ibu juga bisa menekan tombol speaker merah muda di atas kartu untuk mendengarkan penjelasannya.", "instruction-physical")}
              className="text-pink-500 hover:text-pink-600 flex items-center gap-1 text-xs font-bold bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100/50 self-start sm:self-auto"
            >
              <Volume2 className="w-3.5 h-3.5" /> Cara Memakai
            </button>
          </div>

          {/* CAROUSEL WRAPPER */}
          <div className="relative max-w-xl mx-auto">
            
            {/* Card Content with AnimatePresence */}
            <div className="relative overflow-hidden min-h-[220px] sm:min-h-[240px] flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={activeCarouselIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="w-full bg-gradient-to-br from-amber-50/40 via-amber-50/20 to-orange-50/30 rounded-[36px] border border-amber-150 p-6 sm:p-8 text-center flex flex-col justify-between items-center gap-4 shadow-sm min-h-[180px] sm:min-h-[200px]"
                >
                  <div className="space-y-3 w-full">
                    {/* Badge & Voice button */}
                    <div className="flex justify-between items-center w-full">
                      <span className="px-3 py-1 bg-amber-500 text-white rounded-full font-black text-[10px] uppercase tracking-wider shadow-sm">
                        Batasan {activeCarouselIndex + 1} dari {physicalRestrictions.length}
                      </span>
                      <button
                        onClick={() => {
                          const act = physicalRestrictions[activeCarouselIndex];
                          playSpeech(`Nomor ${activeCarouselIndex + 1}: ${act.title}. Penjelasan: ${act.desc}`, `act-${activeCarouselIndex}`);
                        }}
                        className={`h-8 w-8 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all ${
                          speaking === `act-${activeCarouselIndex}` ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                        title="Dengarkan Penjelasan"
                      >
                        {speaking === `act-${activeCarouselIndex}` ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>

                    <h4 className="text-sm sm:text-base font-black text-gray-800 leading-tight uppercase tracking-wider pt-2">
                      {physicalRestrictions[activeCarouselIndex].title}
                    </h4>
                    <p className="text-xs text-gray-650 font-bold max-w-md mx-auto leading-relaxed">
                      {physicalRestrictions[activeCarouselIndex].desc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* CAROUSEL CONTROLS */}
            <div className="flex justify-between items-center gap-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setDirection(-1);
                  setActiveCarouselIndex(prev => (prev === 0 ? physicalRestrictions.length - 1 : prev - 1));
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    setSpeaking(null);
                  }
                }}
                className="h-11 w-11 bg-white border border-gray-150 rounded-2xl flex items-center justify-center text-gray-500 hover:text-pink-500 hover:border-pink-200 transition-all shadow-sm active:scale-95 shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* DOT INDICATORS */}
              <div className="flex gap-2">
                {physicalRestrictions.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDirection(idx > activeCarouselIndex ? 1 : -1);
                      setActiveCarouselIndex(idx);
                      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        setSpeaking(null);
                      }
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeCarouselIndex === idx 
                        ? 'w-7 bg-amber-500 shadow-sm' 
                        : 'w-2 bg-gray-200 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setDirection(1);
                  setActiveCarouselIndex(prev => (prev === physicalRestrictions.length - 1 ? 0 : prev + 1));
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    setSpeaking(null);
                  }
                }}
                className="h-11 w-11 bg-white border border-gray-150 rounded-2xl flex items-center justify-center text-gray-500 hover:text-pink-500 hover:border-pink-200 transition-all shadow-sm active:scale-95 shrink-0"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </section>

        {/* SECTION 4: ONE-TAP EMERGENCY PORTAL (SOS BANNER) */}
        <section className="bg-red-950 rounded-[40px] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden text-center sm:text-left space-y-6">
          <div className="absolute top-0 right-0 p-12 opacity-10 translate-x-10 translate-y-10">
            <Phone className="w-64 h-64" />
          </div>
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 bg-red-800 text-red-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-current" /> DARURAT MEDIS SOS
            </span>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Apakah Ibu Mengalami <br className="hidden sm:inline" />Tanda Bahaya di Atas Sekarang?
            </h3>
            <p className="text-xs sm:text-sm text-red-200 leading-relaxed max-w-xl font-bold">
              Jangan panik, jangan tunda. Bicarakan segera dengan Dokter atau Bidan Anda. Klik tombol darurat merah di bawah untuk langsung menelpon pihak medis terdekat dari telepon Ibu sekarang.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 relative z-10 pt-4 max-w-md">
            <a 
              href="tel:112"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Phone className="w-5 h-5" /> Telepon Ambulans (112)
            </a>
            <button 
              onClick={() => playSpeech("Jika Ibu mengalami salah satu tanda bahaya di atas, segera hubungi keluarga dan telpon rumah sakit atau bidan terdekat melalui nomor telepon darurat di bawah ini.", "call-intro")}
              className="bg-white/10 hover:bg-white/20 text-white py-4 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border border-white/20 transition-transform active:scale-95"
            >
              <Volume2 className="w-5 h-5 animate-bounce" /> Panduan Darurat
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
