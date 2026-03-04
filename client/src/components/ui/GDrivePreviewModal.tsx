// src/components/ui/GDrivePreviewModal.tsx
import { useEffect, useRef, useState } from 'react';
import {
  X,
  ExternalLink,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { GDriveFile } from '../../lib/gdrive';
import { FILE_TYPE_COLOR, FILE_TYPE_ICON, FILE_TYPE_LABEL } from '../../lib/gdrive';
import type { BuktiDukung } from '../../types/bukti';

interface Props {
  bukti: BuktiDukung;
  driveFile: GDriveFile;
  onClose: () => void;
}

export default function GDrivePreviewModal({ bukti, driveFile, onClose }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const typeColor = FILE_TYPE_COLOR[driveFile.type] || FILE_TYPE_COLOR.unknown;
  const typeIcon = FILE_TYPE_ICON[driveFile.type] || FILE_TYPE_ICON.unknown;
  const typeLabel = FILE_TYPE_LABEL[driveFile.type] || 'Dokumen';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-5xl h-[90vh] sm:h-[88vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          {/* File type badge */}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 flex-shrink-0 ${typeColor}`}>
            <span>{typeIcon}</span>
            <span>{typeLabel}</span>
          </span>

          {/* File name */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">{bukti.namaFile}</p>
            {bukti.subKompetensiKode && (
              <p className="text-xs text-slate-400">Bukti fisik — Sub-kompetensi {bukti.subKompetensiKode}</p>
            )}
          </div>

          {/* Verified badge */}
          {bukti.verified && (
            <span className="flex-shrink-0 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              ✓ Terverifikasi
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <a
              href={driveFile.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              title="Unduh"
            >
              <Download className="w-4 h-4" />
            </a>
            <a
              href={driveFile.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              title="Buka di Google Drive"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              title={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 relative bg-slate-100 min-h-0">
          {/* Loading state */}
          {loading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50 z-10">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-sm text-slate-500">Memuat dokumen...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-50 z-10 p-8">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-700">Tidak dapat memuat preview</p>
                <p className="text-sm text-slate-400 mt-1">
                  Pastikan file sudah dibagikan secara publik atau "Anyone with the link"
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setError(false); setLoading(true); if (iframeRef.current) iframeRef.current.src = driveFile.embedUrl; }}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Coba lagi
                </button>
                <a
                  href={driveFile.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka di Drive
                </a>
              </div>
            </div>
          )}

          {/* iframe embed */}
          <iframe
            ref={iframeRef}
            src={driveFile.embedUrl}
            className="w-full h-full border-0"
            title={bukti.namaFile}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
            allow="autoplay"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>

        {/* Footer info */}
        {bukti.catatan && (
          <div className="px-4 py-2.5 border-t border-slate-100 bg-amber-50 flex-shrink-0">
            <p className="text-xs text-amber-700">
              <span className="font-semibold">Catatan dari sekolah: </span>
              {bukti.catatan}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
