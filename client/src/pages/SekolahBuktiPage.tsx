// src/pages/SekolahBuktiPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPenilaianPublic, saveBuktiFisik } from '../lib/firestore';
import type { PenilaianKepala } from '../types';
import { KOMPETENSI } from '../types';
import type { BuktiDukung, BuktiFisikMap } from '../types/bukti';
import BuktiFisikCell from '../components/ui/BuktiFisikCell';
import { Save, GraduationCap, CheckCircle2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

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

export default function SekolahBuktiPage() {
  const { id } = useParams<{ id: string }>();
  const [penilaian, setPenilaian] = useState<PenilaianKepala | null>(null);
  const [buktiMap, setBuktiMap] = useState<BuktiFisikMap>({});
  const [expanded, setExpanded] = useState<string[]>(['1']);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPenilaianPublic(id)
      .then((p) => {
        setPenilaian(p);
        const latest = p.penilaianTahunan?.find((pt: any) => pt.tahunKe === p.tahunAktif);
        if (latest?.buktiFisik) setBuktiMap(latest.buktiFisik);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const totalBukti = Object.values(buktiMap).reduce((sum, arr) => sum + arr.length, 0);
  const completedSubK = Object.entries(buktiMap).filter(([, v]) => v.length > 0).length;
  const totalSubK = KOMPETENSI.reduce((sum, k) => sum + k.subKompetensi.length, 0);

  const handleBuktiChange = (kode: string, buktis: BuktiDukung[]) => {
    setBuktiMap((prev) => ({ ...prev, [kode]: buktis }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!penilaian || !id) return;
    setSaving(true);
    try {
      await saveBuktiFisik(id, penilaian.tahunAktif, buktiMap);
      toast.success('✅ Bukti fisik berhasil disimpan!');
      setSaved(true);
    } catch {
      toast.error('Gagal menyimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!penilaian) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-slate-500">Link penilaian tidak ditemukan atau sudah kadaluarsa.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-emerald-800 text-white px-4 py-4 shadow-lg">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">PKKM — Pengisian Bukti Fisik</p>
              <p className="text-emerald-200 text-xs">Penilaian Kinerja Kepala Madrasah · Tahun ke-{penilaian.tahunAktif}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="font-semibold">{penilaian.kepala.nama}</p>
            <p className="text-emerald-200 text-xs">{penilaian.madrasah.namaMadrasah} · {penilaian.madrasah.kabupatenKota}</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-slate-800">Progress Pengisian</p>
              <p className="text-xs text-slate-400 mt-0.5">{totalBukti} dokumen dari {completedSubK}/{totalSubK} sub-kompetensi</p>
            </div>
            <p className="text-2xl font-black text-emerald-600">{Math.round((completedSubK / totalSubK) * 100)}%</p>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-2.5 bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedSubK / totalSubK) * 100}%` }} />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 space-y-1">
              <p className="font-semibold">Cara pengisian bukti fisik:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-xs text-blue-600">
                <li>Simpan dokumen di <strong>Google Drive sekolah</strong> Anda</li>
                <li>Klik kanan pada file → <strong>Share</strong> → set ke <em>"Anyone with the link"</em></li>
                <li>Salin link, lalu tempel di kolom <strong>"Tambah bukti fisik"</strong></li>
                <li>Klik <strong>Simpan Perubahan</strong> setelah semua dokumen dimasukkan</li>
              </ol>
            </div>
          </div>
        </div>

        {KOMPETENSI.map((komp) => {
          const isExpanded = expanded.includes(komp.kode);
          const kompBuktiCount = komp.subKompetensi.reduce((s, sk) => s + (buktiMap[sk.kode]?.length || 0), 0);
          const kompSubFilled = komp.subKompetensi.filter((sk) => (buktiMap[sk.kode]?.length || 0) > 0).length;

          return (
            <div key={komp.kode} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpanded((prev) =>
                  prev.includes(komp.kode) ? prev.filter((k) => k !== komp.kode) : [...prev, komp.kode]
                )}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
              >
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0',
                  kompSubFilled === komp.subKompetensi.length ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                )}>
                  {kompSubFilled === komp.subKompetensi.length ? <CheckCircle2 className="w-4 h-4" /> : komp.kode}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{komp.nama}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{kompSubFilled}/{komp.subKompetensi.length} sub-kompetensi · {kompBuktiCount} dokumen</p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isExpanded && (
                <div className="divide-y divide-slate-100 border-t border-slate-100">
                  {komp.subKompetensi.map((sk) => {
                    const buktis = buktiMap[sk.kode] || [];
                    const required = BUKTI_FISIK_REQUIRED[sk.kode] || [];
                    return (
                      <div key={sk.kode} className="p-4">
                        <div className="flex items-start gap-2 mb-3">
                          <span className={clsx('text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 mt-0.5',
                            buktis.length > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                          )}>{sk.kode}</span>
                          <p className="text-sm text-slate-700 leading-relaxed">{sk.nama}</p>
                        </div>
                        {required.length > 0 && (
                          <div className="mb-3 pl-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Dokumen yang diperlukan:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                              {required.map((r) => {
                                const done = buktis.some((b) => b.namaFile.toLowerCase().includes(r.toLowerCase().slice(0, 8)));
                                return (
                                  <div key={r} className={clsx('flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg',
                                    done ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                                  )}>
                                    {done
                                      ? <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-emerald-500" />
                                      : <span className="w-3 h-3 border border-dashed border-slate-300 rounded-full flex-shrink-0" />
                                    }
                                    {r}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <BuktiFisikCell
                          subKompetensiKode={sk.kode}
                          buktis={buktis}
                          onChange={(b) => handleBuktiChange(sk.kode, b)}
                          canVerify={false}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="sticky bottom-4 mt-6">
          <button
            onClick={handleSave}
            disabled={saving || totalBukti === 0}
            className={clsx(
              'w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg',
              saved
                ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            {saved
              ? <><CheckCircle2 className="w-4 h-4" />Tersimpan</>
              : <><Save className="w-4 h-4" />{saving ? 'Menyimpan...' : `Simpan ${totalBukti} Dokumen Bukti Fisik`}</>
            }
          </button>
          {totalBukti === 0 && (
            <p className="text-center text-xs text-slate-400 mt-2">Tambahkan minimal 1 dokumen untuk dapat menyimpan</p>
          )}
        </div>
        <div className="h-8" />
      </main>
    </div>
  );
}
