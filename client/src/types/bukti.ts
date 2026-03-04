// src/types/bukti.ts
// Extension types for Bukti Dukung (Evidence) feature

export interface BuktiDukung {
  id: string;             // uuid
  subKompetensiKode: string; // e.g. "1.1"
  namaFile: string;       // display name, editable
  driveUrl: string;       // original share URL from school
  driveFileId?: string;   // extracted file ID
  fileType?: string;      // doc | sheet | slide | pdf | image | video | unknown
  uploadedBy?: string;    // uid or name
  uploadedAt?: string;    // ISO date
  catatan?: string;       // optional note from school
  verified?: boolean;     // marked by pengawas
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface BuktiFisikMap {
  [subKompetensiKode: string]: BuktiDukung[];
}
