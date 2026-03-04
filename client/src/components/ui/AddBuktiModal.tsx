// src/components/ui/AddBuktiModal.tsx
import { useState, useEffect, useRef } from 'react';
import { X, Link2, CheckCircle2, AlertCircle, Eye, EyeOff, FileText, FileSpreadsheet, FileImage, FileBadge2, ChevronDown } from 'lucide-react';
import { buildGDriveUrls, FILE_TYPE_COLOR, FILE_TYPE_ICON, FILE_TYPE_LABEL } from '../../lib/gdrive';
import type { BuktiDukung } from '../../types/bukti';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface Props {
  subKompetensiKode: string;
  onAdd: (bukti: BuktiDukung) => void;
  onClose: () => void;
  defaultName?: string;
}

const FILE_TYPE_TIPS: Record<string, { label: string; icon: React.ReactNode; hint: string; placeholder: string }> = {
  doc: {
    label: 'Google Docs / Word',
    icon: <FileText className="w-4 h-4 text-blue-500" />,
    hint: 'Buka file di Google Docs → Share → Anyone with the link → Copy link',
    placeholder: 'https://docs.google.com/document/d/...',
  },
  sheet: {
    label: 'Google Sheets / Excel',
    icon: <FileSpreadsheet className="w-4 h-4 text-green-500" />,
    hint: 'Buka file di Google Sheets → Share → Anyone with the link → Copy link',
    placeholder: 'https://docs.google.com/spreadsheets/d/...',
  },
  pdf: {
    label: 'PDF',
    icon: <FileBadge2 className="w-4 h-4 text-red-500" />,
    hint: 'Upload PDF ke Google Drive → klik kanan → Share → Anyone with the link → Copy link',
    placeholder: 'https://drive.google.com/file/d/...',
  },
  image: {
    label: 'Foto / Gambar (JPG, PNG)',
    icon: <FileImage className="w-4 h-4 text-purple-500" />,
    hint: 'Upload foto ke Google Drive → klik kanan → Share → Anyone with the link → Copy link',
    placeholder: 'https://drive.google.com/file/d/...',
  },
};

export default function AddBuktiModal({ subKompetensiKode, onAdd, onClose, defaultName = '' }: Props) {
  const [url, setUrl] = useState('');
  const [nama, setNama] = useState(defaultName);
  const [catatan, setCatatan] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedHint, setSelectedHint] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const driveFile = url.trim() ? buildGDriveUrls(url.trim()) : null;
  const isValid = Boolean(driveFile);
  const isGDriveUrl = url.includes('drive.google.com') || url.includes('docs.google.com');

  const handleSubmit = () => {
    if (!url.trim() || !isValid) return;
    const finalName = nama.trim() || (driveFile ? FILE_TYPE_LABEL[driveFile.type] : 'Dokumen');
    onAdd({
      id: generateId(),
      subKompetensiKode,
      namaFile: finalName,
      driveUrl: url.trim(),
      driveFileId: driveFile?.id,
      fileType: driveFile?.type,
      uploadedAt: new Date().toISOString(),
      catatan: catatan.trim() || undefined,
      verified: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Tambah Bukti Fisik</h3>
            <p className="text-xs text-slate-400 mt-0.5">Sub-kompetensi {subKompetensiKode}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* File type quick-select hints */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jenis Dokumen</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(FILE_TYPE_TIPS).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setSelectedHint(selectedHint === key ? null : key)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all text-sm ${
                    selectedHint === key
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  {info.icon}
                  <span className="font-medium text-xs leading-tight">{info.label}</span>
                </button>
              ))}
            </div>

            {/* Hint for selected type */}
            {selectedHint && FILE_TYPE_TIPS[selectedHint] && (
              <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-xs text-blue-700 flex gap-2">
                <span className="text-blue-400 mt-0.5">💡</span>
                <span>{FILE_TYPE_TIPS[selectedHint].hint}</span>
              </div>
            )}
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Link Google Drive <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={
                  selectedHint && FILE_TYPE_TIPS[selectedHint]
                    ? FILE_TYPE_TIPS[selectedHint].placeholder
                    : 'https://drive.google.com/file/d/...'
                }
                className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${
                  url && !isGDriveUrl ? 'border-red-300 focus:ring-red-300' :
                  url && isValid ? 'border-emerald-300 focus:ring-emerald-300' :
                  url && !isValid ? 'border-amber-300 focus:ring-amber-300' :
                  'border-slate-200 focus:ring-emerald-400'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {url && isValid && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {url && !isValid && isGDriveUrl && <AlertCircle className="w-4 h-4 text-amber-500" />}
                {url && !isGDriveUrl && <AlertCircle className="w-4 h-4 text-red-400" />}
              </div>
            </div>

            {/* Validation messages */}
            {url && !isGDriveUrl && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Hanya link Google Drive yang didukung
              </p>
            )}
            {url && isGDriveUrl && !isValid && (
              <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Format link tidak dikenali — pastikan salin dari tombol "Copy link"
              </p>
            )}
            {url && isValid && driveFile && (
              <p className={`text-xs mt-1.5 flex items-center gap-1.5 font-medium`}>
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600">
                  {FILE_TYPE_ICON[driveFile.type]} {FILE_TYPE_LABEL[driveFile.type]} terdeteksi
                </span>
              </p>
            )}
          </div>

          {/* Preview toggle */}
          {isValid && driveFile && (
            <div className="space-y-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                  showPreview
                    ? 'border-blue-300 bg-blue-50 text-blue-600'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white hover:border-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPreview ? 'Sembunyikan Preview' : 'Preview Dokumen'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${FILE_TYPE_COLOR[driveFile.type]}`}>
                  {FILE_TYPE_ICON[driveFile.type]} {FILE_TYPE_LABEL[driveFile.type]}
                </span>
              </button>

              {showPreview && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner" style={{ height: 260 }}>
                  <iframe
                    src={driveFile.embedUrl}
                    className="w-full h-full border-0"
                    title="preview"
                    allow="autoplay"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                </div>
              )}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nama / Label Dokumen
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder={isValid && driveFile ? FILE_TYPE_LABEL[driveFile.type] : 'Contoh: Bagan Struktur Organisasi 2024'}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
            />
            <p className="text-xs text-slate-400 mt-1">Opsional. Jika kosong akan menggunakan jenis file.</p>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Catatan <span className="font-normal text-slate-400">(opsional)</span>
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan keterangan atau konteks dokumen ini..."
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!url.trim() || !isValid}
            className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-emerald-200"
          >
            Simpan Bukti
          </button>
        </div>
      </div>
    </div>
  );
}
