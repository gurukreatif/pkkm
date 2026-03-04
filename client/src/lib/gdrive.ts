// src/lib/gdrive.ts
// Converts any Google Drive share link into a previewable embed URL

export type GDriveFileType = 'doc' | 'sheet' | 'slide' | 'pdf' | 'image' | 'video' | 'folder' | 'unknown';

export interface GDriveFile {
  id: string;
  type: GDriveFileType;
  originalUrl: string;
  embedUrl: string;
  previewUrl: string;
  downloadUrl: string;
  thumbnailUrl: string;
}

/**
 * Extract Google Drive file ID from any share URL format:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://docs.google.com/document/d/FILE_ID/edit
 * - https://docs.google.com/spreadsheets/d/FILE_ID/edit
 * - https://docs.google.com/presentation/d/FILE_ID/edit
 * - https://drive.google.com/drive/folders/FOLDER_ID
 */
export function extractGDriveId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{20,})/,
    /\/document\/d\/([a-zA-Z0-9_-]{20,})/,
    /\/spreadsheets\/d\/([a-zA-Z0-9_-]{20,})/,
    /\/presentation\/d\/([a-zA-Z0-9_-]{20,})/,
    /\/drawings\/d\/([a-zA-Z0-9_-]{20,})/,
    /\/forms\/d\/([a-zA-Z0-9_-]{20,})/,
    /[?&]id=([a-zA-Z0-9_-]{20,})/,
    /\/folders\/([a-zA-Z0-9_-]{20,})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function detectGDriveType(url: string): GDriveFileType {
  if (url.includes('docs.google.com/document')) return 'doc';
  if (url.includes('docs.google.com/spreadsheets')) return 'sheet';
  if (url.includes('docs.google.com/presentation')) return 'slide';
  if (url.includes('/folders/')) return 'folder';
  // Detect from URL or filename params
  const lower = url.toLowerCase();
  if (lower.includes('.pdf') || lower.includes('pdf')) return 'pdf';
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)/i.test(url)) return 'image';
  if (/\.(mp4|mov|avi|mkv|webm)/i.test(url)) return 'video';
  // Default: treat as generic file (Google Drive built-in preview handles PDF/images)
  return 'unknown';
}

export function buildGDriveUrls(url: string): GDriveFile | null {
  const id = extractGDriveId(url);
  if (!id) return null;

  const type = detectGDriveType(url);

  let embedUrl = '';
  let previewUrl = '';

  if (type === 'doc') {
    embedUrl = `https://docs.google.com/document/d/${id}/preview`;
    previewUrl = `https://docs.google.com/document/d/${id}/preview`;
  } else if (type === 'sheet') {
    embedUrl = `https://docs.google.com/spreadsheets/d/${id}/preview`;
    previewUrl = `https://docs.google.com/spreadsheets/d/${id}/preview`;
  } else if (type === 'slide') {
    embedUrl = `https://docs.google.com/presentation/d/${id}/preview`;
    previewUrl = `https://docs.google.com/presentation/d/${id}/preview`;
  } else {
    // Generic file — use Google Drive's built-in preview
    embedUrl = `https://drive.google.com/file/d/${id}/preview`;
    previewUrl = `https://drive.google.com/file/d/${id}/preview`;
  }

  return {
    id,
    type,
    originalUrl: url,
    embedUrl,
    previewUrl,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${id}`,
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w400`,
  };
}

export const FILE_TYPE_LABEL: Record<GDriveFileType, string> = {
  doc: 'Google Docs',
  sheet: 'Google Sheets',
  slide: 'Google Slides',
  pdf: 'PDF',
  image: 'Gambar',
  video: 'Video',
  folder: 'Folder Drive',
  unknown: 'Dokumen',
};

export const FILE_TYPE_COLOR: Record<GDriveFileType, string> = {
  doc: 'text-blue-600 bg-blue-50 border-blue-200',
  sheet: 'text-green-600 bg-green-50 border-green-200',
  slide: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  pdf: 'text-red-600 bg-red-50 border-red-200',
  image: 'text-purple-600 bg-purple-50 border-purple-200',
  video: 'text-pink-600 bg-pink-50 border-pink-200',
  folder: 'text-orange-600 bg-orange-50 border-orange-200',
  unknown: 'text-slate-600 bg-slate-50 border-slate-200',
};

export const FILE_TYPE_ICON: Record<GDriveFileType, string> = {
  doc: '📄',
  sheet: '📊',
  slide: '📽️',
  pdf: '📕',
  image: '🖼️',
  video: '🎬',
  folder: '📁',
  unknown: '📎',
};
