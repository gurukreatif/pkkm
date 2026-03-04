// src/lib/api.ts — re-export dari firestore.ts agar import lama tetap berjalan
// Express backend sudah dihapus, semua operasi langsung ke Firestore

export {
  getAllPenilaian,
  getPenilaianById,
  getPenilaianPublic,
  createPenilaian,
  updatePenilaian,
  deletePenilaian,
  saveBuktiFisik,
} from './firestore';

// Stub auth — tidak dipakai lagi, tapi di-export agar tidak error jika ada import lama
export async function login() {}
export async function logout() {}
export async function getMe() { return null; }
export async function changePassword() {}
export async function getUsers() { return []; }
export async function createUser() {}
export async function deleteUser() {}
