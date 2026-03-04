// src/pages/PenilaianDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPenilaianById } from '../lib/firestore';
import { useAuth } from '../hooks/useAuth';
import { can } from '../lib/rbac';
import type { PenilaianKepala } from '../types';
import { hitungPredikat } from '../types';
import {
  ChevronLeft,
  Pencil,
  Printer,
  ClipboardCheck,
  User,
  Building2,
  Calendar,
  TrendingUp,
  Link2,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import clsx from 'clsx';

const PREDIKAT_COLOR: Record<string, string> = {
  'Amat Baik': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'Baik': 'text-blue-700 bg-blue-50 border-blue-200',
  'Cukup': 'text-yellow-700 bg-yellow-50 border-yellow-200',
  'Sedang': 'text-orange-700 bg-orange-50 border-orange-200',
  'Kurang': 'text-red-700 bg-red-50 border-red-200',
};

export default function PenilaianDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<PenilaianKepala | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;
    getPenilaianById(id).then(setP).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-7 h-7 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;
  if (!p) return <div className="text-center py-12 text-slate-500">Data tidak ditemukan</div>;

  const nilaiAkhir = p.nilaiKumulatif?.nkkm ?? p.penilaianTahunan?.slice(-1)[0]?.nilaiAkhirTahun ?? 0;
  const predikat = p.nilaiKumulatif?.predikatAkhir ?? hitungPredikat(nilaiAkhir);

  // Trend data
  const trendData = [1, 2, 3, 4].map((t) => {
    const pt = p.penilaianTahunan?.find((x) => x.tahunKe === t);
    return { name: `Thn ${t}`, nilai: pt?.nilaiAkhirTahun ?? null };
  }).filter((d) => d.nilai !== null);

  // Last year radar
  const lastPT = p.penilaianTahunan?.find((x) => x.tahunKe === p.tahunAktif);
  const radarData = lastPT ? [
    { subject: 'PKKS 1', value: lastPT.hasilKompetensi.pkks1 },
    { subject: 'PKKS 2', value: lastPT.hasilKompetensi.pkks2 },
    { subject: 'PKKS 3', value: lastPT.hasilKompetensi.pkks3 },
    { subject: 'PKKS 4', value: lastPT.hasilKompetensi.pkks4 },
  ] : [];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link to="/penilaian" className="p-2 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg mt-0.5">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{p.kepala.nama}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{p.madrasah.namaMadrasah} · {p.madrasah.kabupatenKota}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const link = `${window.location.origin}/bukti/${id}`;
              navigator.clipboard.writeText(link);
              toast.success('Link sekolah disalin!');
            }}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            title="Salin link untuk sekolah mengisi bukti fisik"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Link Sekolah</span>
          </button>
          <Link to={`/print/${id}`} target="_blank" className="p-2 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg" title="Cetak">
            <Printer className="w-4 h-4" />
          </Link>
          {can.editPenilaian(user?.role ?? 'operator') && (
            <Link to={`/penilaian/${id}/edit`} className="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors">
              <Pencil className="w-3.5 h-3.5" />Edit
            </Link>
          )}
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-3xl font-bold text-slate-800">{nilaiAkhir.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">Nilai Akhir</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <span className={clsx('text-sm font-bold px-3 py-1 rounded-full border', PREDIKAT_COLOR[predikat] || '')}>
            {predikat}
          </span>
          <p className="text-xs text-slate-500 mt-2">Predikat</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">Ke-{p.tahunAktif}</p>
          <p className="text-xs text-slate-500 mt-1">Tahun Penilaian</p>
        </div>
      </div>

      {/* Identity */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-emerald-500" /> Data Kepala Madrasah
          </h3>
          <dl className="space-y-2 text-sm">
            {[
              ['NIP', p.kepala.nip],
              ['Jenis Kelamin', p.kepala.jenisKelamin],
              ['Tempat/Tgl Lahir', p.kepala.tempatTanggalLahir],
              ['Jabatan', p.kepala.jabatan],
              ['Pangkat/Gol', p.kepala.pangkatGolongan],
              ['Pendidikan', p.kepala.pendidikanTerakhir],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-slate-400 min-w-[110px]">{k}</dt>
                <dd className="text-slate-700 font-medium">{v || '-'}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-emerald-500" /> Data Madrasah
          </h3>
          <dl className="space-y-2 text-sm">
            {[
              ['Nama', p.madrasah.namaMadrasah],
              ['Status', p.madrasah.status],
              ['NPSN', p.madrasah.npsn],
              ['Kecamatan', p.madrasah.kecamatan],
              ['Kab/Kota', p.madrasah.kabupatenKota],
              ['Provinsi', p.madrasah.provinsi],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-slate-400 min-w-[80px]">{k}</dt>
                <dd className="text-slate-700 font-medium">{v || '-'}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Penilaian per tahun */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-500" /> Penilaian Per Tahun
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100">
          {[1, 2, 3, 4].map((t) => {
            const pt = p.penilaianTahunan?.find((x) => x.tahunKe === t);
            const isActive = p.tahunAktif === t;
            return (
              <div key={t} className={clsx('bg-white p-5', isActive && 'ring-2 ring-inset ring-emerald-400')}>
                <div className="flex items-center justify-between mb-3">
                  <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600')}>
                    Tahun {t}
                  </span>
                  {pt?.status === 'selesai' && <span className="text-xs text-emerald-500">✓</span>}
                </div>
                {pt ? (
                  <>
                    <p className="text-2xl font-bold text-slate-800">{pt.nilaiAkhirTahun.toFixed(1)}</p>
                    <p className={clsx('text-xs font-medium mt-1', PREDIKAT_COLOR[pt.predikat]?.split(' ')[0] || '')}>{pt.predikat}</p>
                    <div className="mt-3 space-y-1">
                      {['pkks1', 'pkks2', 'pkks3', 'pkks4'].map((k, i) => (
                        <div key={k} className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 w-10">PKKS{i + 1}</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                            <div className="h-1.5 bg-emerald-400 rounded-full" style={{ width: `${pt.hasilKompetensi[k as keyof typeof pt.hasilKompetensi]}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500">{(pt.hasilKompetensi[k as keyof typeof pt.hasilKompetensi] as number).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                    {can.inputSkor(user?.role ?? 'operator') && (
                      <Link to={`/penilaian/${id}/instrumen/${t}`} className="mt-3 block text-center text-xs text-emerald-600 hover:text-emerald-800 font-medium">
                        Edit Instrumen
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="text-center mt-4">
                    <p className="text-slate-400 text-xs mb-3">Belum dinilai</p>
                    {can.inputSkor(user?.role ?? 'operator') && (
                      <Link to={`/penilaian/${id}/instrumen/${t}`} className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium transition-colors">
                        Mulai Penilaian
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      {(trendData.length > 1 || radarData.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {trendData.length > 1 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Tren Nilai
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="nilai" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Nilai" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {radarData.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Profil Kompetensi (Thn {p.tahunAktif})</h3>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Nilai" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* 4-year summary */}
      {p.nilaiKumulatif && (
        <div className="bg-emerald-800 rounded-xl p-5 text-white">
          <h3 className="font-bold text-lg mb-4">Nilai Kinerja Kepala Madrasah (NKKM) — 4 Tahun</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[1, 2, 3, 4].map((t) => {
              const val = [p.nilaiKumulatif!.tahun1, p.nilaiKumulatif!.tahun2, p.nilaiKumulatif!.tahun3, p.nilaiKumulatif!.tahun4][t - 1];
              return (
                <div key={t} className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-emerald-300 text-xs">Tahun {t}</p>
                  <p className="text-2xl font-bold">{val.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between bg-white/10 rounded-lg p-4">
            <div>
              <p className="text-emerald-300 text-sm">NKKM (Rata-rata 4 Tahun)</p>
              <p className="text-4xl font-bold">{p.nilaiKumulatif.nkkm.toFixed(2)}</p>
            </div>
            <span className="text-xl font-bold bg-emerald-500 px-4 py-2 rounded-xl">{p.nilaiKumulatif.predikatAkhir}</span>
          </div>
        </div>
      )}
    </div>
  );
}
