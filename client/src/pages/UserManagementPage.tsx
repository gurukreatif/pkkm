// src/pages/UserManagementPage.tsx
import { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { getAllUsers, updateUserProfile } from '../lib/firestore';
import type { User, UserRole } from '../types';
import { ROLE_LABEL, ROLE_COLOR } from '../lib/rbac';
import { Plus, Pencil, X, Shield, Search, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const ROLES: UserRole[] = ['admin', 'pengawas', 'operator'];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state tambah user
  const [form, setForm] = useState({ email: '', password: '', displayName: '', role: 'operator' as UserRole, npsn: '', kanwil: '' });
  // Form state edit user
  const [editForm, setEditForm] = useState({ displayName: '', role: 'operator' as UserRole, npsn: '', kanwil: '' });

  const load = async () => {
    setLoading(true);
    try { setUsers(await getAllUsers()); }
    catch { toast.error('Gagal memuat data user'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    const s = search.toLowerCase();
    return !s || u.email.toLowerCase().includes(s) || (u.displayName ?? '').toLowerCase().includes(s) || (u.npsn ?? '').includes(s);
  });

  const handleAdd = async () => {
    if (!form.email || !form.password || !form.displayName) {
      toast.error('Email, password, dan nama wajib diisi'); return;
    }
    if (form.role === 'operator' && !form.npsn) {
      toast.error('NPSN wajib diisi untuk role Operator/Sekolah'); return;
    }
    setSaving(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: form.email,
        displayName: form.displayName,
        role: form.role,
        npsn: form.npsn || '',
        kanwil: form.kanwil || '',
      });
      toast.success('User berhasil ditambahkan!');
      setShowAdd(false);
      setForm({ email: '', password: '', displayName: '', role: 'operator', npsn: '', kanwil: '' });
      load();
    } catch (e: any) {
      toast.error(e.message?.includes('email-already-in-use') ? 'Email sudah digunakan' : e.message ?? 'Gagal menambahkan user');
    }
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!editUser) return;
    if (editForm.role === 'operator' && !editForm.npsn) {
      toast.error('NPSN wajib diisi untuk role Operator/Sekolah'); return;
    }
    setSaving(true);
    try {
      await updateUserProfile(editUser.uid, {
        displayName: editForm.displayName,
        role: editForm.role,
        npsn: editForm.npsn,
        kanwil: editForm.kanwil,
      });
      toast.success('User diperbarui!');
      setEditUser(null);
      load();
    } catch { toast.error('Gagal memperbarui user'); }
    setSaving(false);
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setEditForm({ displayName: u.displayName ?? '', role: u.role, npsn: u.npsn ?? '', kanwil: u.kanwil ?? '' });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen User</h1>
          <p className="text-slate-500 text-sm">{users.length} user terdaftar</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />Tambah User
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, email, NPSN..."
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-7 h-7 border-4 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Pengguna</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">NPSN / Kanwil</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold flex-shrink-0">
                          {(u.displayName ?? u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{u.displayName ?? '—'}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full', ROLE_COLOR[u.role])}>
                        <Shield className="w-3 h-3" />{ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-500 text-xs">
                      {u.role === 'operator' && u.npsn ? `NPSN: ${u.npsn}` : u.kanwil || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => openEdit(u)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-12 text-slate-400">Tidak ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah User */}
      {showAdd && (
        <Modal title="Tambah User Baru" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Nama Lengkap <span className="text-red-500">*</span></label>
              <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className={inputCls} placeholder="Nama pengguna" />
            </div>
            <div>
              <label className={labelCls}>Email <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="email@kemenag.go.id" />
            </div>
            <div>
              <label className={labelCls}>Password <span className="text-red-500">*</span></label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} placeholder="Min. 6 karakter" />
            </div>
            <div>
              <label className={labelCls}>Role <span className="text-red-500">*</span></label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className={inputCls + ' bg-white'}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </div>
            {form.role === 'operator' && (
              <div>
                <label className={labelCls}>NPSN Madrasah <span className="text-red-500">*</span></label>
                <input value={form.npsn} onChange={(e) => setForm({ ...form, npsn: e.target.value })} className={inputCls} placeholder="8 digit NPSN" maxLength={8} />
                <p className="text-xs text-slate-400 mt-1">Operator hanya bisa lihat penilaian dengan NPSN ini</p>
              </div>
            )}
            {(form.role === 'pengawas' || form.role === 'admin') && (
              <div>
                <label className={labelCls}>Kanwil / Unit Kerja</label>
                <input value={form.kanwil} onChange={(e) => setForm({ ...form, kanwil: e.target.value })} className={inputCls} placeholder="Contoh: Kalimantan Barat" />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Batal</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm font-semibold">
                {saving ? 'Menyimpan...' : 'Tambah User'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Edit User */}
      {editUser && (
        <Modal title={`Edit — ${editUser.displayName ?? editUser.email}`} onClose={() => setEditUser(null)}>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Nama Lengkap</label>
              <input value={editForm.displayName} onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Role</label>
              <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })} className={inputCls + ' bg-white'}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </div>
            {editForm.role === 'operator' && (
              <div>
                <label className={labelCls}>NPSN Madrasah <span className="text-red-500">*</span></label>
                <input value={editForm.npsn} onChange={(e) => setEditForm({ ...editForm, npsn: e.target.value })} className={inputCls} maxLength={8} />
                <p className="text-xs text-slate-400 mt-1">Operator hanya bisa lihat penilaian dengan NPSN ini</p>
              </div>
            )}
            {(editForm.role === 'pengawas' || editForm.role === 'admin') && (
              <div>
                <label className={labelCls}>Kanwil / Unit Kerja</label>
                <input value={editForm.kanwil} onChange={(e) => setEditForm({ ...editForm, kanwil: e.target.value })} className={inputCls} />
              </div>
            )}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              <strong>Catatan:</strong> Password tidak bisa diubah di sini. Gunakan Firebase Console untuk reset password.
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditUser(null)} className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Batal</button>
              <button onClick={handleEdit} disabled={saving} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm font-semibold">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
