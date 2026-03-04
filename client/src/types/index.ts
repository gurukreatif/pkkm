// src/types/index.ts

export type Predikat = 'Amat Baik' | 'Baik' | 'Cukup' | 'Sedang' | 'Kurang';

export interface DataMadrasah {
  namaMadrasah: string;
  status: 'Negeri' | 'Swasta';
  npsn: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  telp?: string;
  email?: string;
}

export interface DataKepala {
  nama: string;
  nip: string;
  jenisKelamin: 'Laki - laki' | 'Perempuan';
  tempatTanggalLahir: string;
  jabatan: string;
  pangkatGolongan: string;
  tmtKepalaMadrasah?: string;
  masaKerjaTahun?: number;
  masaKerjaBulan?: number;
  nuptk?: string;
  pendidikanTerakhir: string;
}

export interface DataPenilai {
  nama: string;
  nip: string;
  pangkatGolongan?: string;
  jabatan?: string;
  unitKerja?: string;
  tanggalPenilaian?: string;
}

export interface SkorKompetensi {
  kode: string;      // e.g. "1.1"
  unsur: string;
  tugas: string;
  skor: number;      // 0-100
}

export interface HasilKompetensi {
  pkks1: number;   // Usaha Pengembangan Madrasah
  pkks2: number;   // Pelaksanaan Tugas Manajerial
  pkks3: number;   // Pengembangan Kewirausahaan
  pkks4: number;   // Supervisi Guru & Tendik
  nilaiAkhir: number;
  predikat: Predikat;
}

export interface PenilaianTahunan {
  tahunKe: 1 | 2 | 3 | 4;
  tahunPenilaian?: string;
  pengawas1?: DataPenilai;
  pengawas2?: DataPenilai;
  skorDetail: SkorKompetensi[];
  hasilKompetensi: HasilKompetensi;
  nilaiGuru: number;
  nilaiTendik: number;
  nilaiKomite?: number;
  nilaiAkhirTahun: number;
  predikat: Predikat;
  catatanPengawas?: string;
  tanggalSelesai?: string;
  status: 'draft' | 'selesai';
}

export interface NilaiPendukung {
  // Tahun ke-4 only
  nilaiKepalaKanwil?: number;  // Kepala Bidang
  nilaiKepalaKantor?: number;  // Kepala Seksi
  nilaiPengawas: number;
  nilaiGuru: number;
  nilaiTendik: number;
  nilaiKomite: number;
  nilaiAkhirTahun4: number;
  predikatTahun4: Predikat;
}

export interface NilaiKumulatif {
  tahun1: number;
  tahun2: number;
  tahun3: number;
  tahun4: number;
  nkkm: number; // Nilai Kinerja Kepala Madrasah (rata-rata)
  predikatAkhir: Predikat;
}

export interface PenilaianKepala {
  id?: string;
  madrasah: DataMadrasah;
  kepala: DataKepala;
  tim: DataPenilai[];
  penilaianTahunan: PenilaianTahunan[];
  nilaiPendukungTahun4?: NilaiPendukung;
  nilaiKumulatif?: NilaiKumulatif;
  tahunAktif: 1 | 2 | 3 | 4;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'pengawas' | 'operator';
  kanwil?: string;
}

export const PREDIKAT_THRESHOLD = {
  'Amat Baik': 91,
  'Baik': 76,
  'Cukup': 61,
  'Sedang': 51,
  'Kurang': 0,
} as const;

export function hitungPredikat(nilai: number): Predikat {
  if (nilai >= 91) return 'Amat Baik';
  if (nilai >= 76) return 'Baik';
  if (nilai >= 61) return 'Cukup';
  if (nilai >= 51) return 'Sedang';
  return 'Kurang';
}

export const KOMPETENSI = [
  {
    kode: '1',
    nama: 'Usaha Pengembangan Madrasah',
    alias: 'PKKS 1',
    subKompetensi: [
      { kode: '1.1', nama: 'Mengembangkan madrasah sesuai dengan kebutuhan' },
      { kode: '1.2', nama: 'Mengelola perubahan dan pengembangan madrasah menuju organisasi pembelajar yang efektif' },
      { kode: '1.3', nama: 'Mengelola hubungan antara madrasah dan masyarakat dalam rangka pencarian dukungan ide, sumber belajar, dan pembiayaan' },
      { kode: '1.4', nama: 'Mengelola proses pencapaian SNP sesuai dengan arah dan tujuan Pendidikan Nasional' },
      { kode: '1.5', nama: 'Mengelola unit layanan khusus madrasah dalam mendukung kegiatan pembelajaran' },
      { kode: '1.6', nama: 'Mengelola sistem informasi madrasah dalam mendukung penyusunan program dan pengambilan keputusan' },
      { kode: '1.7', nama: 'Memanfaatkan kemajuan teknologi informasi bagi peningkatan pembelajaran dan manajemen madrasah' },
    ],
  },
  {
    kode: '2',
    nama: 'Pelaksanaan Tugas Manajerial',
    alias: 'PKKS 2',
    subKompetensi: [
      { kode: '2.1', nama: 'Menyusun perencanaan Madrasah untuk berbagai tingkatan perencanaan' },
      { kode: '2.2', nama: 'Memimpin madrasah dalam rangka pendayagunaan sumber daya madrasah secara optimal' },
      { kode: '2.3', nama: 'Menciptakan budaya dan iklim madrasah yang kondusif dan inovatif bagi pembelajaran' },
      { kode: '2.4', nama: 'Mengelola guru dan staf dalam rangka pendayagunaan sumber daya manusia secara optimal' },
      { kode: '2.5', nama: 'Mengelola sarana dan prasarana madrasah dalam rangka pendayagunaan secara optimal' },
      { kode: '2.6', nama: 'Mengelola peserta didik dalam rangka penerimaan peserta didik baru dan pengembangan kapasitas' },
      { kode: '2.7', nama: 'Mengelola pengembangan kurikulum dan kegiatan pembelajaran' },
      { kode: '2.8', nama: 'Mengelola keuangan madrasah sesuai prinsip pengelolaan yang akuntabel, transparan, dan efisien' },
      { kode: '2.9', nama: 'Mengelola ketatausahaan madrasah dalam mendukung pencapaian tujuan madrasah' },
      { kode: '2.10', nama: 'Melakukan monitoring, evaluasi dan pelaporan pelaksanaan program kegiatan madrasah' },
    ],
  },
  {
    kode: '3',
    nama: 'Pengembangan Kewirausahaan',
    alias: 'PKKS 3',
    subKompetensi: [
      { kode: '3.1', nama: 'Menciptakan inovasi yang berguna bagi pengembangan madrasah' },
      { kode: '3.2', nama: 'Bekerja keras untuk mencapai keberhasilan madrasah sebagai organisasi pembelajaran yang efektif' },
      { kode: '3.3', nama: 'Memiliki motivasi yang kuat untuk sukses dalam melaksanakan tugas pokok dan fungsinya' },
      { kode: '3.4', nama: 'Pantang menyerah dan selalu mencari solusi terbaik dalam menghadapi kendala madrasah' },
      { kode: '3.5', nama: 'Memiliki naluri kewirausahaan dalam mengelola kegiatan produksi/jasa sebagai sumber belajar siswa' },
    ],
  },
  {
    kode: '4',
    nama: 'Supervisi Kepada Guru dan Tenaga Kependidikan',
    alias: 'PKKS 4',
    subKompetensi: [
      { kode: '4.1', nama: 'Menyusun program supervisi akademik dalam rangka peningkatan profesionalisme guru' },
      { kode: '4.2', nama: 'Melaksanakan supervisi akademik terhadap guru dengan menggunakan pendekatan dan teknik supervisi yang tepat' },
      { kode: '4.3', nama: 'Menilai dan menindaklanjuti kegiatan supervisi akademik dalam rangka peningkatan profesionalisme guru' },
    ],
  },
] as const;
