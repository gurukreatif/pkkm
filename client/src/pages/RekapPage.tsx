// src/pages/RekapPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPenilaian } from '../lib/firestore';
import type { PenilaianKepala } from '../types';
import { hitungPredikat } from '../types';
import { Download, Printer } from 'lucide-react';

const PREDIKAT_COLOR: Record<string, string> = {
  'Amat Baik': 'text-emerald-700 bg-emerald-50',
  'Baik': 'text-blue-700 bg-blue-50',
  'Cukup': 'text-yellow-700 bg-yellow-50',
  'Sedang': 'text-orange-700 bg-orange-50',
  'Kurang': 'text-red-700 bg-red-50',
};

export default function RekapPage() {
  const [data, setData] = useState<PenilaianKepala[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAllPenilaian().then(setData).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-7 h-7 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Rekap & Laporan</h1>
          <p className="text-slate-500 text-sm">Rekapitulasi Penilaian Kinerja Kepala Madrasah</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
        >
          <Printer className="w-4 h-4" />
          Cetak
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-emerald-800 text-white text-center">
          <p className="text-sm font-medium opacity-80">KANTOR WILAYAH KEMENTERIAN AGAMA PROVINSI KALIMANTAN BARAT</p>
          <h2 className="text-lg font-bold mt-0.5">REKAPITULASI PENILAIAN KINERJA KEPALA MADRASAH</h2>
          <p className="text-sm opacity-80 mt-0.5">Kelompok Kerja Pengawas Madrasah</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">No</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Nama Kepala Madrasah</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Madrasah</th>
                <th className="text-center px-3 py-3 font-semibold text-slate-600">Thn 1</th>
                <th className="text-center px-3 py-3 font-semibold text-slate-600">Thn 2</th>
                <th className="text-center px-3 py-3 font-semibold text-slate-600">Thn 3</th>
                <th className="text-center px-3 py-3 font-semibold text-slate-600">Thn 4</th>
                <th className="text-center px-3 py-3 font-semibold text-slate-600">NKKM</th>
                <th className="text-center px-3 py-3 font-semibold text-slate-600">Predikat</th>
                <th className="text-center px-3 py-3 font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((d, i) => {
                const getNilai = (t: number) => d.penilaianTahunan?.find((p) => p.tahunKe === t)?.nilaiAkhirTahun;
                const nkkm = d.nilaiKumulatif?.nkkm;
                const predikat = d.nilaiKumulatif?.predikatAkhir ?? (nkkm ? hitungPredikat(nkkm) : undefined);
                return (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{d.kepala.nama}</p>
                      <p className="text-xs text-slate-400">{d.kepala.nip}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.madrasah.namaMadrasah}</td>
                    {[1, 2, 3, 4].map((t) => {
                      const v = getNilai(t);
                      return (
                        <td key={t} className="px-3 py-3 text-center">
                          {v !== undefined ? <span className="font-semibold text-slate-700">{v.toFixed(1)}</span> : <span className="text-slate-300">—</span>}
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center font-bold text-slate-800">
                      {nkkm ? nkkm.toFixed(2) : '—'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {predikat ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PREDIKAT_COLOR[predikat] || ''}`}>{predikat}</span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Link to={`/print/${d.id}`} target="_blank" className="text-slate-400 hover:text-emerald-600 p-1">
                        <Printer className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr><td colSpan={10} className="text-center py-12 text-slate-400">Belum ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
