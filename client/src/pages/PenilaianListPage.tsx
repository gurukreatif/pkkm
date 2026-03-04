// src/pages/PenilaianListPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPenilaian, deletePenilaian } from '../lib/firestore';
import { useAuth } from '../hooks/useAuth';
import { can } from '../lib/rbac';
import type { PenilaianKepala } from '../types';
import { hitungPredikat } from '../types';
import { Search, Plus, Eye, Trash2, Pencil, Printer, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const PREDIKAT_COLOR: Record<string, string> = {
  'Amat Baik': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'Baik': 'text-blue-700 bg-blue-50 border-blue-200',
  'Cukup': 'text-yellow-700 bg-yellow-50 border-yellow-200',
  'Sedang': 'text-orange-700 bg-orange-50 border-orange-200',
  'Kurang': 'text-red-700 bg-red-50 border-red-200',
};

export default function PenilaianListPage() {
  const [data, setData] = useState<PenilaianKepala[]>([]);
  const [filtered, setFiltered] = useState<PenilaianKepala[]>([]);
  const [search, setSearch] = useState('');
  const [filterTahun, setFilterTahun] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const load = () => {
    setLoading(true);
    getAllPenilaian(user).then((d) => {
      setData(d);
      setFiltered(d);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = data;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.kepala.nama.toLowerCase().includes(s) ||
          d.madrasah.namaMadrasah.toLowerCase().includes(s) ||
          d.kepala.nip.includes(s)
      );
    }
    if (filterTahun) {
      result = result.filter((d) => String(d.tahunAktif) === filterTahun);
    }
    setFiltered(result);
  }, [search, filterTahun, data]);

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus penilaian untuk ${nama}?`)) return;
    try {
      await deletePenilaian(id);
      toast.success('Data berhasil dihapus');
      load();
    } catch {
      toast.error('Gagal menghapus data');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Data Penilaian</h1>
          <p className="text-slate-500 text-sm">{filtered.length} dari {data.length} data</p>
        </div>
        {can.createPenilaian(user?.role ?? 'operator') && (
          <Link to="/penilaian/baru" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />Tambah
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, madrasah, NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div className="relative">
          <select
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">Semua Tahun</option>
            {[1, 2, 3, 4].map((t) => (
              <option key={t} value={String(t)}>Tahun ke-{t}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-7 h-7 border-4 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">Tidak ada data ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Kepala Madrasah</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Madrasah</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Tahun</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Nilai</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Predikat</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((d) => {
                  const nilaiAkhir = d.nilaiKumulatif?.nkkm ?? d.penilaianTahunan?.slice(-1)[0]?.nilaiAkhirTahun ?? 0;
                  const predikat = d.nilaiKumulatif?.predikatAkhir ?? d.penilaianTahunan?.slice(-1)[0]?.predikat ?? hitungPredikat(nilaiAkhir);
                  return (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">{d.kepala.nama}</p>
                        <p className="text-xs text-slate-400">{d.kepala.nip}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-slate-700">{d.madrasah.namaMadrasah}</p>
                        <p className="text-xs text-slate-400">{d.madrasah.kabupatenKota}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          Tahun {d.tahunAktif}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-800">
                        {nilaiAkhir.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={clsx('text-xs font-medium px-2.5 py-1 rounded-full border', PREDIKAT_COLOR[predikat] || '')}>
                          {predikat}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Link to={`/penilaian/${d.id}`} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="Detail">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link to={`/penilaian/${d.id}/edit`} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded transition-colors" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <Link to={`/print/${d.id}`} target="_blank" className="p-1.5 text-slate-400 hover:text-purple-500 hover:bg-purple-50 rounded transition-colors" title="Cetak">
                            <Printer className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(d.id!, d.kepala.nama)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
