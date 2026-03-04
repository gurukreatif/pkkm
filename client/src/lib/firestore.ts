// src/lib/firestore.ts — Firestore CRUD (menggantikan Express API)
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { PenilaianKepala } from '../types';

const COL = 'penilaian';

// ── Helpers ───────────────────────────────────────────────────
function fromFirestore(id: string, data: any): PenilaianKepala {
  return {
    ...data,
    id,
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : data.updatedAt,
  };
}

export function timestampToDate(ts: string | undefined): string {
  if (!ts) return '-';
  return new Date(ts).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

// ── CRUD ──────────────────────────────────────────────────────

export async function getAllPenilaian(params?: { search?: string; kabupaten?: string }): Promise<PenilaianKepala[]> {
  const q = query(collection(db, COL), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  let results = snap.docs.map((d) => fromFirestore(d.id, d.data()));

  if (params?.search) {
    const s = params.search.toLowerCase();
    results = results.filter((r) =>
      r.kepala.nama.toLowerCase().includes(s) ||
      r.madrasah.namaMadrasah.toLowerCase().includes(s) ||
      r.kepala.nip.includes(s)
    );
  }
  if (params?.kabupaten) {
    results = results.filter((r) =>
      r.madrasah.kabupatenKota.toLowerCase().includes(params.kabupaten!.toLowerCase())
    );
  }
  return results;
}

export async function getPenilaianById(id: string): Promise<PenilaianKepala | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return fromFirestore(snap.id, snap.data());
}

// Public alias — dipakai SekolahBuktiPage (tidak perlu auth di Firestore rules)
export async function getPenilaianPublic(id: string): Promise<PenilaianKepala | null> {
  return getPenilaianById(id);
}

export async function createPenilaian(data: Omit<PenilaianKepala, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePenilaian(id: string, data: Partial<PenilaianKepala>): Promise<void> {
  const { id: _id, createdAt, ...rest } = data as any;
  await updateDoc(doc(db, COL, id), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePenilaian(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

// Bukti fisik — disimpan sebagai bagian dari dokumen penilaian
export async function saveBuktiFisik(
  id: string,
  tahunKe: number,
  buktiFisik: Record<string, any>
): Promise<void> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) throw new Error('Penilaian tidak ditemukan');

  const data = snap.data();
  const penilaianTahunan = (data.penilaianTahunan || []).map((pt: any) => {
    if (pt.tahunKe === tahunKe) return { ...pt, buktiFisik };
    return pt;
  });

  // Jika belum ada entry untuk tahun ini, buat baru
  const hasEntry = penilaianTahunan.some((pt: any) => pt.tahunKe === tahunKe);
  if (!hasEntry) {
    penilaianTahunan.push({ tahunKe, buktiFisik, status: 'draft', skorDetail: [] });
  }

  await updateDoc(doc(db, COL, id), {
    penilaianTahunan,
    updatedAt: serverTimestamp(),
  });
}
