# PKKM — Setup Firebase

## 1. Install dependencies
```bash
cd client
npm install
```

## 2. Buat akun user pertama (admin)
Buka Firebase Console → Authentication → Add user:
- Email: `admin@pkkm.local`
- Password: (bebas, min 6 karakter)

Lalu set role admin via Firestore Console:
- Buka Firestore → collection `users` → New document
- Document ID: (UID user yang baru dibuat)
- Fields: `role` = `admin`, `displayName` = `Administrator`

## 3. Deploy Firestore Security Rules
Firebase Console → Firestore → Rules → paste isi `firestore.rules`

## 4. Jalankan dev server
```bash
cd client
npm run dev
```

## 5. Build untuk production (deploy ke Vercel/Netlify)
```bash
cd client
npm run build
# Folder client/dist siap di-deploy
```

## Login default
Sesuai akun yang dibuat di Firebase Authentication.

## Catatan
- Tidak ada backend Express — semua langsung ke Firestore
- Bukti fisik disimpan sebagai link Google Drive di dalam dokumen Firestore
- Backup: export Firestore dari Firebase Console → Firestore → Import/Export
