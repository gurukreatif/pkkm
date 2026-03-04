// src/pages/PrintPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPenilaianById } from '../lib/firestore';
import type { PenilaianKepala } from '../types';
import { hitungPredikat, KOMPETENSI } from '../types';

export default function PrintPage() {
  const { id } = useParams<{ id: string }>();
  const [p, setPenilaian] = useState<PenilaianKepala | null>(null);

  useEffect(() => {
    if (!id) return;
    getPenilaianById(id).then(setPenilaian);
  }, [id]);

  useEffect(() => {
    if (p) setTimeout(() => window.print(), 800);
  }, [p]);

  if (!p) return <div className="p-8 text-center">Memuat data...</div>;

  const nilaiAkhir = p.nilaiKumulatif?.nkkm ?? p.penilaianTahunan?.slice(-1)[0]?.nilaiAkhirTahun ?? 0;
  const predikat = p.nilaiKumulatif?.predikatAkhir ?? hitungPredikat(nilaiAkhir);
  const lastPT = p.penilaianTahunan?.find((x) => x.tahunKe === p.tahunAktif);

  return (
    <div className="print-page font-serif">
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          .print-page { padding: 20mm; }
        }
        .print-page { max-width: 800px; margin: auto; padding: 40px; font-family: 'Times New Roman', serif; font-size: 11pt; }
        h1 { font-size: 14pt; text-align: center; font-weight: bold; }
        .header-text { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10.5pt; }
        th, td { border: 1px solid #333; padding: 5px 8px; }
        th { background: #e8f4f0; text-align: center; font-weight: bold; }
        .section-title { font-weight: bold; margin-top: 16px; margin-bottom: 6px; }
        .info-row { display: flex; gap: 8px; margin: 3px 0; font-size: 11pt; }
        .info-label { min-width: 180px; }
        .footer { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; }
        .ttd-box { height: 70px; }
        .nilai-box { border: 2px solid #333; padding: 12px 20px; display: inline-block; text-align: center; margin: 8px 0; }
      `}</style>

      <div className="header-text">
        <p style={{ fontSize: '12pt', fontWeight: 'bold' }}>KANTOR WILAYAH KEMENTERIAN AGAMA</p>
        <p style={{ fontSize: '12pt', fontWeight: 'bold' }}>PROVINSI KALIMANTAN BARAT</p>
        <hr style={{ border: '2px solid #000', margin: '6px 0' }} />
        <h1>REKAP HASIL PENILAIAN KINERJA KEPALA MADRASAH</h1>
        <p style={{ fontSize: '10pt' }}>Tahun Penilaian ke-{p.tahunAktif}</p>
      </div>

      <div className="section-title">Identitas Kepala Madrasah</div>
      <table>
        <tbody>
          {[
            ['a.', 'Nama', p.kepala.nama],
            ['b.', 'NIP', p.kepala.nip],
            ['c.', 'Tempat/Tanggal Lahir', p.kepala.tempatTanggalLahir],
            ['d.', 'Pangkat/Golongan/Jabatan', `${p.kepala.pangkatGolongan} / ${p.kepala.jabatan}`],
            ['e.', 'Pendidikan Terakhir', p.kepala.pendidikanTerakhir],
            ['f.', 'Nama Madrasah', p.madrasah.namaMadrasah],
            ['g.', 'Status', p.madrasah.status],
            ['h.', 'Kabupaten/Kota', p.madrasah.kabupatenKota],
            ['i.', 'Provinsi', p.madrasah.provinsi],
          ].map(([kode, label, val]) => (
            <tr key={label as string}>
              <td style={{ width: '30px', textAlign: 'center' }}>{kode}</td>
              <td style={{ width: '200px' }}>{label}</td>
              <td>: {val}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {lastPT && (
        <>
          <div className="section-title">Hasil Penilaian Kompetensi — Tahun ke-{p.tahunAktif}</div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Kompetensi</th>
                <th style={{ width: '100px' }}>Nilai</th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 'Usaha Pengembangan Madrasah (PKKS 1)', lastPT.hasilKompetensi.pkks1],
                [2, 'Pelaksanaan Tugas Manajerial (PKKS 2)', lastPT.hasilKompetensi.pkks2],
                [3, 'Pengembangan Kewirausahaan (PKKS 3)', lastPT.hasilKompetensi.pkks3],
                [4, 'Supervisi Kepada Guru dan Tendik (PKKS 4)', lastPT.hasilKompetensi.pkks4],
              ].map(([no, nama, nilai]) => (
                <tr key={no as number}>
                  <td style={{ textAlign: 'center' }}>{no}</td>
                  <td>{nama}</td>
                  <td style={{ textAlign: 'center' }}>{(nilai as number).toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', background: '#f0faf6' }}>
                <td colSpan={2} style={{ textAlign: 'center' }}>Nilai Akhir</td>
                <td style={{ textAlign: 'center' }}>{lastPT.nilaiAkhirTahun.toFixed(2)}</td>
              </tr>
              <tr style={{ fontWeight: 'bold', background: '#f0faf6' }}>
                <td colSpan={2} style={{ textAlign: 'center' }}>Predikat</td>
                <td style={{ textAlign: 'center' }}>{lastPT.predikat}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {p.nilaiKumulatif && (
        <>
          <div className="section-title">Nilai Kinerja Kepala Madrasah (NKKM) — 4 Tahun</div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Komponen</th>
                <th style={{ width: '100px' }}>Nilai</th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 'Penilaian Kinerja Tahun Pertama', p.nilaiKumulatif.tahun1],
                [2, 'Penilaian Kinerja Tahun Kedua', p.nilaiKumulatif.tahun2],
                [3, 'Penilaian Kinerja Tahun Ketiga', p.nilaiKumulatif.tahun3],
                [4, 'Penilaian Kinerja Tahun Keempat', p.nilaiKumulatif.tahun4],
              ].map(([no, nama, nilai]) => (
                <tr key={no as number}>
                  <td style={{ textAlign: 'center' }}>{no}</td>
                  <td>{nama}</td>
                  <td style={{ textAlign: 'center' }}>{(nilai as number).toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', background: '#f0faf6' }}>
                <td colSpan={2} style={{ textAlign: 'center' }}>NKKM (Rata-rata 4 Tahun)</td>
                <td style={{ textAlign: 'center' }}>{p.nilaiKumulatif.nkkm.toFixed(2)}</td>
              </tr>
              <tr style={{ fontWeight: 'bold', background: '#f0faf6' }}>
                <td colSpan={2} style={{ textAlign: 'center' }}>Predikat Akhir</td>
                <td style={{ textAlign: 'center' }}>{p.nilaiKumulatif.predikatAkhir}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      <div className="footer">
        <div>
          <p>Kepala Madrasah,</p>
          <div className="ttd-box" />
          <p style={{ fontWeight: 'bold' }}>{p.kepala.nama}</p>
          <p>NIP. {p.kepala.nip}</p>
        </div>
        <div>
          <p>Ketua TIM Penilai,</p>
          <div className="ttd-box" />
          <p style={{ fontWeight: 'bold' }}>{p.tim?.[0]?.nama || '________________'}</p>
          <p>NIP. {p.tim?.[0]?.nip || '________________'}</p>
        </div>
      </div>
    </div>
  );
}
