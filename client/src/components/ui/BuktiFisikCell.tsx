// src/components/ui/BuktiFisikCell.tsx
import { useState } from 'react';
import { Plus, Eye, Trash2, CheckCircle2, FileWarning } from 'lucide-react';
import { buildGDriveUrls, FILE_TYPE_COLOR, FILE_TYPE_ICON, FILE_TYPE_LABEL } from '../../lib/gdrive';
import type { BuktiDukung } from '../../types/bukti';
import GDrivePreviewModal from './GDrivePreviewModal';
import AddBuktiModal from './AddBuktiModal';

interface Props {
  subKompetensiKode: string;
  buktis: BuktiDukung[];
  onChange: (buktis: BuktiDukung[]) => void;
  readOnly?: boolean;
  canVerify?: boolean;
  onVerify?: (buktiId: string, verified: boolean) => void;
}

export default function BuktiFisikCell({
  subKompetensiKode,
  buktis,
  onChange,
  readOnly = false,
  canVerify = false,
  onVerify,
}: Props) {
  const [previewBukti, setPreviewBukti] = useState<BuktiDukung | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = (bukti: BuktiDukung) => {
    onChange([...buktis, bukti]);
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Hapus bukti ini?')) return;
    onChange(buktis.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-1.5">
      {/* List of bukti */}
      {buktis.map((bukti) => {
        const driveFile = bukti.driveUrl ? buildGDriveUrls(bukti.driveUrl) : null;
        const typeColor = driveFile ? FILE_TYPE_COLOR[driveFile.type] : FILE_TYPE_COLOR.unknown;
        const typeIcon = driveFile ? FILE_TYPE_ICON[driveFile.type] : '📎';
        const isValid = Boolean(driveFile);

        return (
          <div
            key={bukti.id}
            className="group flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2.5 py-2 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            {/* Type icon badge */}
            <span
              className={`text-sm flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border ${typeColor}`}
              title={driveFile ? FILE_TYPE_LABEL[driveFile.type] : 'Link tidak valid'}
            >
              {isValid ? typeIcon : '⚠️'}
            </span>

            {/* Name */}
            <span className="flex-1 text-xs text-slate-700 truncate min-w-0 font-medium">
              {bukti.namaFile}
            </span>

            {/* Verified badge */}
            {bukti.verified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" title="Terverifikasi pengawas" />
            )}

            {/* Actions — always visible on mobile, hover on desktop */}
            <div className="flex items-center gap-0.5 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {/* Preview — klik langsung buka modal */}
              {isValid && driveFile && (
                <button
                  onClick={() => setPreviewBukti(bukti)}
                  className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Preview dokumen"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
              {/* Verify */}
              {canVerify && isValid && (
                <button
                  onClick={() => onVerify?.(bukti.id, !bukti.verified)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    bukti.verified
                      ? 'text-emerald-500 hover:text-slate-400 hover:bg-slate-50'
                      : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'
                  }`}
                  title={bukti.verified ? 'Batalkan verifikasi' : 'Verifikasi dokumen'}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
              {/* Delete */}
              {!readOnly && (
                <button
                  onClick={() => handleDelete(bukti.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Invalid URL indicator */}
            {!isValid && (
              <span className="text-[10px] text-red-500 flex-shrink-0 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-200">
                Link tidak valid
              </span>
            )}
          </div>
        );
      })}

      {/* Add button */}
      {!readOnly && (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-300 rounded-xl text-xs text-slate-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah bukti fisik</span>
        </button>
      )}

      {buktis.length === 0 && readOnly && (
        <div className="flex items-center gap-1.5 text-xs text-slate-300 py-1">
          <FileWarning className="w-3.5 h-3.5" />
          <span>Belum ada bukti</span>
        </div>
      )}

      {/* Preview Modal */}
      {previewBukti && (() => {
        const df = buildGDriveUrls(previewBukti.driveUrl);
        return df ? (
          <GDrivePreviewModal
            bukti={previewBukti}
            driveFile={df}
            onClose={() => setPreviewBukti(null)}
          />
        ) : null;
      })()}

      {/* Add Bukti Modal */}
      {showAdd && (
        <AddBuktiModal
          subKompetensiKode={subKompetensiKode}
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
