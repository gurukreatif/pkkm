// src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPenilaian } from '../lib/firestore';
import { useAuth } from '../hooks/useAuth';
import { can } from '../lib/rbac';
import type { PenilaianKepala } from '../types';
import { hitungPredikat } from '../types';
import {
  Users,
  TrendingUp,
  Star,
  Award,
  Plus,
  ArrowRight,
  Building2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';

const PREDIKAT_COLOR: Record<string, string> = {
  'Amat Baik': 'text-emerald-600 bg-emerald-50',
  'Baik': 'text-blue-600 bg-blue-50',
  'Cukup': 'text-yellow-600 bg-yellow-50',
  'Sedang': 'text-orange-600 bg-orange-50',
  'Kurang': 'text-red-600 bg-red-50',
};

export default function DashboardPage() {
  const [data, setData] = useState<PenilaianKepala[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getAllPenilaian(user).then(setData).finally(() => setLoading(false));
  }, [user]);

  // Stats
  const total = data.length;
  const selesai = data.filter((d) => d.penilaianTahunan?.some((p) => p.status === 'selesai')).length;
  const rerata =
    data.length > 0
      ? data.reduce((sum, d) => {
          const na = d.nilaiKumulatif?.nkkm ?? d.penilaianTahunan?.slice(-1)[0]?.nilaiAkhirTahun ?? 0;
          return sum + na;
        }, 0) / data.length
      : 0;
  const amatBaik = data.filter(
    (d) => (d.nilaiKumulatif?.predikatAkhir ?? d.penilaianTahunan?.slice(-1)[0]?.predikat) === 'Amat Baik'
  ).length;

  // Chart data per tahun penilaian
  const tahunDist = [1, 2, 3, 4].map((t) => ({
    name: `Tahun ${t}`,
    jumlah: data.filter((d) => d.tahunAktif === t).length,
  }));

  // Recent entries
  const recent = data.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Sistem Penilaian Kinerja Kepala Madrasah (PKKM)</p>
        </div>
        <Link
          to="/penilaian/baru"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Penilaian Baru
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Kepala Madrasah', value: total, icon: Users, color: 'bg-blue-500', sub: 'terdaftar' },
          { label: 'Penilaian Selesai', value: selesai, icon: TrendingUp, color: 'bg-emerald-500', sub: 'dari ' + total },
          { label: 'Nilai Rerata', value: rerata.toFixed(1), icon: Star, color: 'bg-amber-500', sub: 'dari 100' },
          { label: 'Predikat Amat Baik', value: amatBaik, icon: Award, color: 'bg-purple-500', sub: 'kepala madrasah' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Distribusi Per Tahun Penilaian</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tahunDist} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#10b981" radius={[4, 4, 0, 0]} name="Jumlah" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Distribusi Predikat</h2>
          <div className="space-y-3 pt-2">
            {['Amat Baik', 'Baik', 'Cukup', 'Sedang', 'Kurang'].map((p) => {
              const count = data.filter(
                (d) => (d.nilaiKumulatif?.predikatAkhir ?? d.penilaianTahunan?.slice(-1)[0]?.predikat) === p
              ).length;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={p} className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full min-w-[80px] text-center ${PREDIKAT_COLOR[p] || ''}`}>{p}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent entries */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Penilaian Terbaru</h2>
          <Link to="/penilaian" className="text-emerald-500 hover:text-emerald-600 text-sm flex items-center gap-1">
            Lihat semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada data penilaian</p>
            <Link to="/penilaian/baru" className="text-emerald-500 text-sm mt-2 inline-block">
              Tambah penilaian pertama
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((d) => {
              const nilaiAkhir = d.nilaiKumulatif?.nkkm ?? d.penilaianTahunan?.slice(-1)[0]?.nilaiAkhirTahun ?? 0;
              const predikat = d.nilaiKumulatif?.predikatAkhir ?? d.penilaianTahunan?.slice(-1)[0]?.predikat ?? hitungPredikat(nilaiAkhir);
              return (
                <Link key={d.id} to={`/penilaian/${d.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-xs font-bold">
                    {d.kepala.nama.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{d.kepala.nama}</p>
                    <p className="text-xs text-slate-400 truncate">{d.madrasah.namaMadrasah} · Tahun ke-{d.tahunAktif}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-sm">{nilaiAkhir.toFixed(1)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PREDIKAT_COLOR[predikat] || ''}`}>{predikat}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
