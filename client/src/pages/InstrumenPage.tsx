// src/pages/InstrumenPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPenilaianById, updatePenilaian } from '../lib/firestore';
import type { PenilaianKepala, SkorKompetensi, PenilaianTahunan } from '../types';
import { KOMPETENSI, hitungPredikat } from '../types';
import type { BuktiDukung, BuktiFisikMap } from '../types/bukti';
import { Save, ChevronLeft, CheckCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import BuktiFisikCell from '../components/ui/BuktiFisikCell';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth';

const SKOR_OPTIONS = [
  { value: 100, label: '4', desc: 'Selalu' },
  { value: 75, label: '3', desc: 'Sering' },
  { value: 50, label: '2', desc: 'Kadang' },
  { value: 25, label: '1', desc: 'Tidak pernah' },
];

const BUKTI_FISIK_REQUIRED: Record<string, string[]> = {
  '1.1': ['Bagan/struktur organisasi', 'Notulen rapat penyusunan struktur', 'Dokumen sosialisasi', 'Daftar Hadir'],
  '1.2': ['Dokumen program pengembangan madrasah', 'Laporan pelaksanaan program'],
  '1.3': ['MOU dengan masyarakat/instansi', 'Dokumen kerjasama', 'Laporan kegiatan'],
  '1.4': ['Dokumen perencanaan SNP', 'Laporan pencapaian SNP'],
  '1.5': ['Jadwal layanan khusus', 'Laporan layanan peserta didik'],
  '1.6': ['SIM Madrasah', 'Laporan data madrasah'],
  '1.7': ['Penggunaan TIK dalam pembelajaran', 'Website/media sosial madrasah'],
  '2.1': ['RKAM', 'RKM / RKJM'],
  '2.2': ['SK Pembagian Tugas', 'Laporan pelaksanaan tugas'],
  '2.3': ['Program budaya sekolah', 'Tata tertib madrasah'],
  '2.4': ['Daftar guru dan staf', 'Program pengembangan SDM'],
  '2.5': ['Inventaris sarana prasarana', 'Program pemeliharaan sarpras'],
  '2.6': ['Buku induk siswa', 'Laporan PPDB', 'Program ekstra kurikuler'],
  '2.7': ['Kurikulum madrasah', 'Jadwal pelajaran', 'RPP/Modul ajar'],
  '2.8': ['RAPBM', 'Laporan keuangan', 'BKU'],
  '2.9': ['Buku agenda surat', 'Notulen rapat', 'Arsip administrasi'],
  '2.10': ['Laporan monitoring dan evaluasi', 'Program tindak lanjut'],
  '3.1': ['Dokumen inovasi madrasah', 'Laporan inovasi'],
  '3.2': ['Laporan program unggulan', 'Penghargaan/sertifikat'],
  '3.3': ['Program motivasi', 'Laporan kegiatan motivasi'],
  '3.4': ['Dokumentasi problem solving', 'Laporan kendala dan solusi'],
  '3.5': ['Program kewirausahaan', 'Laporan unit produksi/jasa'],
  '4.1': ['Program supervisi akademik', 'Jadwal supervisi'],
  '4.2': ['Instrumen supervisi', 'Laporan hasil supervisi'],
  '4.3': ['Laporan tindak lanjut supervisi', 'Program pembinaan guru'],
};

export default function InstrumenPage() {
  const { id, tahun } = useParams<{ id: string; tahun: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tahunKe = Number(tahun) as 1 | 2 | 3 | 4;

  const [penilaian, setPenilaian] = useState<PenilaianKepala | null>(null);
  const [skorMap, setSkorMap] = useState<Record<string, number>>({});
  const [buktiMap, setBuktiMap] = useState<BuktiFisikMap>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedKomp, setExpandedKomp] = useState<string[]>(['1', '2', '3', '4']);
  const [activeTab, setActiveTab] = useState<'penilaian' | 'bukti'>('penilaian');

  useEffect(() => {
    if (!id) return;
    getPenilaianById(id).then((p) => {
      if (!p) return;
      setPenilaian(p);
      const existing = p.penilaianTahunan?.find((pt) => pt.tahunKe === tahunKe);
      if (existing?.skorDetail) {
        const m: Record<string, number> = {};
        existing.skorDetail.forEach((s) => { m[s.kode] = s.skor; });
        setSkorMap(m);
      } else {
        const m: Record<string, number> = {};
        KOMPETENSI.forEach((k) => k.subKompetensi.forEach((sk) => { m[sk.kode] = 100; }));
        setSkorMap(m);
      }
      if ((existing as any)?.buktiFisik) setBuktiMap((existing as any).buktiFisik);
    }).finally(() => setLoading(false));
  }, [id, tahunKe]);

  const hitungPKKS = (kode: string) => {
    const komp = KOMPETENSI.find((k) => k.kode === kode);
    if (!komp) return 0;
    const total = komp.subKompetensi.reduce((sum, sk) => sum + (skorMap[sk.kode] ?? 100), 0);
    return total / komp.subKompetensi.length;
  };

  const hitungNilaiAkhir = () => [1,2,3,4].map((k) => hitungPKKS(String(k))).reduce((s,v)=>s+v,0)/4;

  const totalBukti = Object.values(buktiMap).reduce((sum, arr) => sum + arr.length, 0);
  const verifiedBukti = Object.values(buktiMap).reduce((sum, arr) => sum + arr.filter((b) => b.verified).length, 0);

  const handleBuktiChange = (kode: string, buktis: BuktiDukung[]) => setBuktiMap((prev) => ({ ...prev, [kode]: buktis }));

  const handleVerify = (kode: string, buktiId: string, verified: boolean) => {
    setBuktiMap((prev) => ({
      ...prev,
      [kode]: (prev[kode] || []).map((b) =>
        b.id === buktiId ? { ...b, verified, verifiedBy: user?.displayName || user?.email, verifiedAt: new Date().toISOString() } : b
      ),
    }));
  };

  const toggleKomp = (kode: string) => setExpandedKomp((prev) => prev.includes(kode) ? prev.filter((k) => k !== kode) : [...prev, kode]);

  const handleSave = async (status: 'draft' | 'selesai') => {
    if (!penilaian || !id) return;
    setSaving(true);
    try {
      const skorDetail: SkorKompetensi[] = [];
      KOMPETENSI.forEach((k) => k.subKompetensi.forEach((sk) => {
        skorDetail.push({ kode: sk.kode, unsur: sk.nama, tugas: k.nama, skor: skorMap[sk.kode] ?? 100 });
      }));
      const pkks1=hitungPKKS('1'), pkks2=hitungPKKS('2'), pkks3=hitungPKKS('3'), pkks4=hitungPKKS('4');
      const nilaiAkhir = hitungNilaiAkhir();
      const predikat = hitungPredikat(nilaiAkhir);
      const penilaianBaru: any = {
        tahunKe, skorDetail,
        hasilKompetensi: { pkks1, pkks2, pkks3, pkks4, nilaiAkhir, predikat },
        nilaiGuru: penilaian.penilaianTahunan?.find((p) => p.tahunKe === tahunKe)?.nilaiGuru ?? 100,
        nilaiTendik: penilaian.penilaianTahunan?.find((p) => p.tahunKe === tahunKe)?.nilaiTendik ?? 100,
        nilaiAkhirTahun: nilaiAkhir, predikat, status,
        buktiFisik: buktiMap,
      };
      const updated = (penilaian.penilaianTahunan ?? []).filter((p) => p.tahunKe !== tahunKe);
      updated.push(penilaianBaru);
      await updatePenilaian(id, { penilaianTahunan: updated, tahunAktif: tahunKe });
      toast.success(status === 'selesai' ? '✅ Penilaian diselesaikan!' : '💾 Draft tersimpan');
      navigate(`/penilaian/${id}`);
    } catch { toast.error('Gagal menyimpan data'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-7 h-7 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;
  if (!penilaian) return <div className="text-center py-12 text-slate-500">Data tidak ditemukan</div>;

  const nilaiAkhir = hitungNilaiAkhir();

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link to={`/penilaian/${id}`} className="p-2 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg mt-0.5 flex-shrink-0">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-800">Instrumen Penilaian</h1>
          <p className="text-slate-500 text-sm mt-0.5 truncate">
            {penilaian.kepala.nama} · {penilaian.madrasah.namaMadrasah} · <span className="text-emerald-600 font-semibold">Tahun ke-{tahunKe}</span>
          </p>
        </div>
      </div>

      {/* Live score bar */}
      <div className="bg-slate-900 rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-slate-400 text-xs mb-0.5">Nilai Sementara</p>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-white tabular-nums">{nilaiAkhir.toFixed(1)}</span>
            <span className={clsx('text-sm font-bold px-3 py-1 rounded-full',
              nilaiAkhir >= 91 ? 'bg-emerald-500 text-white' :
              nilaiAkhir >= 76 ? 'bg-blue-500 text-white' :
              'bg-amber-500 text-white'
            )}>{hitungPredikat(nilaiAkhir)}</span>
          </div>
        </div>
        <div className="flex gap-4">
          {[1,2,3,4].map((k) => {
            const val = hitungPKKS(String(k));
            return (
              <div key={k} className="text-center">
                <div className="text-[10px] text-slate-500 mb-0.5">PKKS {k}</div>
                <div className="text-base font-black text-white tabular-nums">{val.toFixed(0)}</div>
                <div className="mt-1 h-1 bg-slate-700 rounded-full w-10">
                  <div className="h-1 bg-emerald-400 rounded-full" style={{ width: `${val}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center pl-4 border-l border-slate-700">
          <div className="text-[10px] text-slate-500 mb-0.5">Bukti Fisik</div>
          <div className="text-base font-black text-emerald-400">{totalBukti}</div>
          <div className="text-[10px] text-slate-500">{verifiedBukti} ok</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['penilaian', 'bukti'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}>
            {tab === 'penilaian' ? <><CheckCircle className="w-3.5 h-3.5" />Penilaian Skor</> : <><FileText className="w-3.5 h-3.5" />Bukti Fisik{totalBukti > 0 && <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalBukti}</span>}</>}
          </button>
        ))}
      </div>

      {/* ===== TAB PENILAIAN ===== */}
      {activeTab === 'penilaian' && (
        <div className="space-y-3">
          {KOMPETENSI.map((komp) => {
            const isExpanded = expandedKomp.includes(komp.kode);
            return (
              <div key={komp.kode} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <button onClick={() => toggleKomp(komp.kode)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 transition-colors text-left">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded">{komp.alias}</span>
                      <span className="font-semibold text-white text-sm">{komp.nama}</span>
                    </div>
                  </div>
                  <span className="text-xl font-black text-emerald-400 tabular-nums">{hitungPKKS(komp.kode).toFixed(1)}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isExpanded && (
                  <div className="divide-y divide-slate-100">
                    {komp.subKompetensi.map((sk) => (
                      <div key={sk.kode} className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex-shrink-0 mt-0.5">{sk.kode}</span>
                          <p className="text-sm text-slate-700 flex-1">{sk.nama}</p>
                          <span className="text-lg font-black text-slate-800 tabular-nums flex-shrink-0">{skorMap[sk.kode] ?? 100}</span>
                        </div>
                        <div className="flex gap-2 ml-10">
                          {SKOR_OPTIONS.map((opt) => (
                            <button key={opt.value} onClick={() => setSkorMap((prev) => ({ ...prev, [sk.kode]: opt.value }))}
                              className={clsx('flex-1 py-2 rounded-lg border text-xs font-semibold transition-all',
                                skorMap[sk.kode] === opt.value
                                  ? 'border-emerald-500 bg-emerald-500 text-white'
                                  : 'border-slate-200 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50'
                              )}>
                              <span className="block text-base">{opt.label}</span>
                              <span className="block text-[10px] opacity-70">{opt.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===== TAB BUKTI FISIK ===== */}
      {activeTab === 'bukti' && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-black text-slate-800">{totalBukti}</p>
              <p className="text-xs text-slate-400">Total Bukti</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-600">{verifiedBukti}</p>
              <p className="text-xs text-slate-400">Terverifikasi</p>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Progress verifikasi pengawas</span>
                <span className="font-semibold">{totalBukti > 0 ? Math.round((verifiedBukti/totalBukti)*100) : 0}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-2.5 bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalBukti > 0 ? (verifiedBukti/totalBukti)*100 : 0}%` }} />
              </div>
            </div>
          </div>

          {KOMPETENSI.map((komp) => (
            <div key={komp.kode} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{komp.alias}</span>
                <span className="font-semibold text-slate-700 text-sm">{komp.nama}</span>
                <span className="ml-auto text-xs text-slate-400">
                  {Object.entries(buktiMap).filter(([k]) => k.startsWith(komp.kode+'.') || k === komp.kode).reduce((s,[,v])=>s+v.length,0)} dokumen
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {komp.subKompetensi.map((sk) => {
                  const buktis = buktiMap[sk.kode] || [];
                  const required = BUKTI_FISIK_REQUIRED[sk.kode] || [];
                  return (
                    <div key={sk.kode} className="p-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{sk.kode}</span>
                          <p className="text-sm font-medium text-slate-700">{sk.nama}</p>
                        </div>
                        {required.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Dokumen yang diperlukan:</p>
                            <div className="flex flex-wrap gap-1">
                              {required.map((r) => {
                                const hasBukti = buktis.some((b) => b.namaFile.toLowerCase().includes(r.toLowerCase().slice(0, 8)));
                                return (
                                  <span key={r} className={clsx('text-[10px] px-2 py-0.5 rounded-full border',
                                    hasBukti ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                                  )}>
                                    {hasBukti ? '✓ ' : ''}{r}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <BuktiFisikCell
                        subKompetensiKode={sk.kode}
                        buktis={buktis}
                        onChange={(b) => handleBuktiChange(sk.kode, b)}
                        canVerify={user?.role === 'pengawas' || user?.role === 'admin'}
                        onVerify={(buktiId, verified) => handleVerify(sk.kode, buktiId, verified)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex gap-3 py-6">
        <button onClick={() => handleSave('draft')} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" />Simpan Draft
        </button>
        <button onClick={() => handleSave('selesai')} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm">
          <CheckCircle className="w-4 h-4" />{saving ? 'Menyimpan...' : 'Selesaikan Penilaian'}
        </button>
      </div>
    </div>
  );
}
