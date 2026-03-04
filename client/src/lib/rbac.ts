// src/lib/rbac.ts — helper RBAC terpusat
import type { UserRole } from '../types';

export const can = {
  // Penilaian
  createPenilaian: (role: UserRole) => role === 'admin' || role === 'pengawas',
  editPenilaian:   (role: UserRole) => role === 'admin' || role === 'pengawas',
  deletePenilaian: (role: UserRole) => role === 'admin',
  viewAllPenilaian:(role: UserRole) => role === 'admin' || role === 'pengawas',

  // Instrumen
  inputSkor:       (role: UserRole) => role === 'admin' || role === 'pengawas',

  // Bukti fisik
  uploadBukti:     (role: UserRole) => true, // semua bisa upload
  verifikasiBukti: (role: UserRole) => role === 'admin' || role === 'pengawas',

  // Laporan
  viewRekap:       (role: UserRole) => role === 'admin' || role === 'pengawas',

  // User management
  manageUsers:     (role: UserRole) => role === 'admin',
};

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrator',
  pengawas: 'Pengawas / Asesor',
  operator: 'Operator / Sekolah',
};

export const ROLE_COLOR: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700',
  pengawas: 'bg-blue-100 text-blue-700',
  operator: 'bg-emerald-100 text-emerald-700',
};
