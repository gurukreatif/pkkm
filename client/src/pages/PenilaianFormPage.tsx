// src/pages/PenilaianFormPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPenilaianById, createPenilaian, updatePenilaian } from '../lib/firestore';
import type { PenilaianKepala, DataMadrasah, DataKepala, DataPenilai } from '../types';
import { ChevronLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const initialMadrasah: DataMadrasah = {
  namaMadrasah: '', status: 'Negeri', npsn: '', alamat: '',
  desa: '', kecamatan: '', kabupatenKota: '', provinsi: 'Kalimantan Barat',
};

const initialKepala: DataKepala = {
  nama: '', nip: '', jenisKelamin: 'Perempuan', tempatTanggalLahir: '',
  jabatan: '', pangkatGolongan: '', pendidikanTerakhir: 'S1',
};

const initialPenilai: DataPenilai = { nama: '', nip: '' };

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent";
const selectCls = inputCls + " bg-white";

export default function PenilaianFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [madrasah, setMadrasah] = useState<DataMadrasah>(initialMadrasah);
  const [kepala, setKepala] = useState<DataKepala>(initialKepala);
  const [penilai, setPenilai] = useState<DataPenilai>(initialPenilai);
  const [tahunAktif, setTahunAktif] = useState<1 | 2 | 3 | 4>(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!id) return;
    getPenilaianById(id).then((p) => {
      if (!p) return;
      setMadrasah(p.madrasah);
      setKepala(p.kepala);
      setPenilai(p.tim?.[0] ?? initialPenilai);
      setTahunAktif(p.tahunAktif);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kepala.nama || !madrasah.namaMadrasah) { toast.error('Nama kepala dan madrasah wajib diisi'); return; }
    setSaving(true);
    try {
      const payload: Omit<PenilaianKepala, 'id'> = {
        madrasah,
        kepala,
        tim: [penilai],
        tahunAktif,
        penilaianTahunan: [],
      };
      if (isEdit && id) {
        await updatePenilaian(id, { madrasah, kepala, tim: [penilai], tahunAktif });
        toast.success('Data berhasil diperbarui');
        navigate(`/penilaian/${id}`);
      } else {
        const newId = await createPenilaian(payload);
        toast.success('Data berhasil disimpan');
        navigate(`/penilaian/${newId}`);
      }
    } catch {
      toast.error('Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-7 h-7 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/penilaian" className="p-2 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{isEdit ? 'Edit' : 'Tambah'} Penilaian</h1>
          <p className="text-slate-500 text-sm">Data madrasah, kepala madrasah, dan penilai</p>
        </div>
      </div>

      {/* Section: Data Madrasah */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">A. Data Madrasah</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nama Madrasah" required>
            <input value={madrasah.namaMadrasah} onChange={(e) => setMadrasah({ ...madrasah, namaMadrasah: e.target.value })} className={inputCls} required />
          </Field>
          <Field label="Status">
            <select value={madrasah.status} onChange={(e) => setMadrasah({ ...madrasah, status: e.target.value as any })} className={selectCls}>
              <option>Negeri</option>
              <option>Swasta</option>
            </select>
          </Field>
          <Field label="NPSN">
            <input value={madrasah.npsn} onChange={(e) => setMadrasah({ ...madrasah, npsn: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Kabupaten/Kota">
            <input value={madrasah.kabupatenKota} onChange={(e) => setMadrasah({ ...madrasah, kabupatenKota: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Kecamatan">
            <input value={madrasah.kecamatan} onChange={(e) => setMadrasah({ ...madrasah, kecamatan: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Desa/Kelurahan">
            <input value={madrasah.desa} onChange={(e) => setMadrasah({ ...madrasah, desa: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Provinsi">
            <input value={madrasah.provinsi} onChange={(e) => setMadrasah({ ...madrasah, provinsi: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Alamat">
            <input value={madrasah.alamat} onChange={(e) => setMadrasah({ ...madrasah, alamat: e.target.value })} className={inputCls} />
          </Field>
        </div>
      </section>

      {/* Section: Data Kepala */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">B. Data Kepala Madrasah</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nama" required>
            <input value={kepala.nama} onChange={(e) => setKepala({ ...kepala, nama: e.target.value })} className={inputCls} required />
          </Field>
          <Field label="NIP">
            <input value={kepala.nip} onChange={(e) => setKepala({ ...kepala, nip: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Jenis Kelamin">
            <select value={kepala.jenisKelamin} onChange={(e) => setKepala({ ...kepala, jenisKelamin: e.target.value as any })} className={selectCls}>
              <option>Laki - laki</option>
              <option>Perempuan</option>
            </select>
          </Field>
          <Field label="Tempat/Tanggal Lahir">
            <input value={kepala.tempatTanggalLahir} onChange={(e) => setKepala({ ...kepala, tempatTanggalLahir: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Jabatan">
            <input value={kepala.jabatan} onChange={(e) => setKepala({ ...kepala, jabatan: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Pangkat/Golongan">
            <input value={kepala.pangkatGolongan} onChange={(e) => setKepala({ ...kepala, pangkatGolongan: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Pendidikan Terakhir">
            <select value={kepala.pendidikanTerakhir} onChange={(e) => setKepala({ ...kepala, pendidikanTerakhir: e.target.value })} className={selectCls}>
              {['S3', 'S2', 'S1', 'D4', 'D3', 'SMA/MA'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Tahun Penilaian Ke-">
            <select value={tahunAktif} onChange={(e) => setTahunAktif(Number(e.target.value) as any)} className={selectCls}>
              {[1, 2, 3, 4].map((t) => <option key={t} value={t}>Tahun ke-{t}</option>)}
            </select>
          </Field>
        </div>
      </section>

      {/* Section: Data Penilai */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">C. Data Pengawas/Penilai</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nama Pengawas">
            <input value={penilai.nama} onChange={(e) => setPenilai({ ...penilai, nama: e.target.value })} className={inputCls} />
          </Field>
          <Field label="NIP Pengawas">
            <input value={penilai.nip} onChange={(e) => setPenilai({ ...penilai, nip: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Jabatan Pengawas">
            <input value={penilai.jabatan ?? ''} onChange={(e) => setPenilai({ ...penilai, jabatan: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Unit Kerja">
            <input value={penilai.unitKerja ?? ''} onChange={(e) => setPenilai({ ...penilai, unitKerja: e.target.value })} className={inputCls} />
          </Field>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        <Link to="/penilaian" className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
          Batal
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Menyimpan...' : (isEdit ? 'Perbarui' : 'Simpan')}
        </button>
      </div>
    </form>
  );
}
