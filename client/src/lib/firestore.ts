// src/lib/firestore.ts
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { PenilaianKepala, User, UserRole } from '../types';

// ── helpers ──────────────────────────────────────────────────
function fromFirestore(id: string, data: any): PenilaianKepala {
  return {
    ...data, id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
  };
}
export function timestampToDate(ts: string | undefined): string {
  if (!ts) return '-';
  return new Date(ts).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── PENILAIAN ────────────────────────────────────────────────

// currentUser dipakai untuk filter RBAC
export async function getAllPenilaian(currentUser?: User | null): Promise<PenilaianKepala[]> {
  const q = query(collection(db, 'penilaian'), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  let results = snap.docs.map((d) => fromFirestore(d.id, d.data()));

  // Operator hanya lihat data dengan NPSN yang sama
  if (currentUser?.role === 'operator' && currentUser.npsn) {
    results = results.filter((r) => r.madrasah.npsn === currentUser.npsn);
  }
  return results;
}

export async function getPenilaianById(id: string): Promise<PenilaianKepala | null> {
  const snap = await getDoc(doc(db, 'penilaian', id));
  if (!snap.exists()) return null;
  return fromFirestore(snap.id, snap.data());
}

export async function getPenilaianPublic(id: string): Promise<PenilaianKepala | null> {
  return getPenilaianById(id);
}

export async function createPenilaian(data: Omit<PenilaianKepala, 'id'>, createdBy?: string): Promise<string> {
  const ref = await addDoc(collection(db, 'penilaian'), {
    ...data,
    createdBy: createdBy ?? '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePenilaian(id: string, data: Partial<PenilaianKepala>): Promise<void> {
  const { id: _id, createdAt, ...rest } = data as any;
  await updateDoc(doc(db, 'penilaian', id), { ...rest, updatedAt: serverTimestamp() });
}

export async function deletePenilaian(id: string): Promise<void> {
  await deleteDoc(doc(db, 'penilaian', id));
}

export async function saveBuktiFisik(id: string, tahunKe: number, buktiFisik: Record<string, any>): Promise<void> {
  const snap = await getDoc(doc(db, 'penilaian', id));
  if (!snap.exists()) throw new Error('Penilaian tidak ditemukan');
  const data = snap.data();
  let penilaianTahunan = (data.penilaianTahunan || []).map((pt: any) =>
    pt.tahunKe === tahunKe ? { ...pt, buktiFisik } : pt
  );
  if (!penilaianTahunan.some((pt: any) => pt.tahunKe === tahunKe)) {
    penilaianTahunan.push({ tahunKe, buktiFisik, status: 'draft', skorDetail: [] });
  }
  await updateDoc(doc(db, 'penilaian', id), { penilaianTahunan, updatedAt: serverTimestamp() });
}

// ── USERS (admin only) ───────────────────────────────────────

export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      email: data.email ?? '',
      displayName: data.displayName ?? '',
      role: data.role ?? 'operator',
      npsn: data.npsn ?? '',
      kanwil: data.kanwil ?? '',
    } as User;
  });
}

export async function getUserById(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as User;
}

export async function updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
  const { uid: _uid, ...rest } = data as any;
  await updateDoc(doc(db, 'users', uid), rest);
}

export async function createUserProfile(uid: string, data: Omit<User, 'uid'>): Promise<void> {
  const { setDoc, doc: fsDoc } = await import('firebase/firestore');
  await setDoc(fsDoc(db, 'users', uid), data);
}
