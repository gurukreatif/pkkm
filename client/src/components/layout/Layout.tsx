// src/components/layout/Layout.tsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, ClipboardList, BarChart3, LogOut,
  Menu, BookOpen, GraduationCap, ChevronRight,
  ChevronDown, Shield, Users,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { can, ROLE_LABEL, ROLE_COLOR } from '../../lib/rbac';
import type { UserRole } from '../../types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const role = (user?.role ?? 'operator') as UserRole;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    toast.success('Berhasil keluar');
    navigate('/login');
  };

  const initials = (user?.displayName ?? user?.email ?? 'U')
    .split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  // Nav dinamis berdasarkan role
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true, show: true },
    { to: '/penilaian', icon: ClipboardList,
      label: role === 'operator' ? 'Hasil Penilaian Saya' : 'Data Penilaian', show: true },
    { to: '/rekap', icon: BarChart3, label: 'Rekap & Laporan', show: can.viewRekap(role) },
    { to: '/users', icon: Users, label: 'Manajemen User', show: can.manageUsers(role) },
  ].filter((n) => n.show);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={clsx(
        'fixed top-0 left-0 h-full w-64 bg-slate-900 z-30 flex flex-col transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-700">
          <img src="/logo.png" alt="PKKM" className="w-9 h-9 object-contain rounded-lg" />
          <div>
            <p className="font-bold text-white text-sm leading-tight">PKKM</p>
            <p className="text-slate-400 text-xs">Penilaian Kinerja Kepala Madrasah</p>
          </div>
        </div>

        {/* Role badge di sidebar */}
        <div className="px-5 py-3 border-b border-slate-800">
          <span className={clsx(
            'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full',
            ROLE_COLOR[role]
          )}>
            <Shield className="w-3 h-3" />
            {ROLE_LABEL[role]}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 h-14 flex items-center px-4 gap-4">
          <button className="lg:hidden p-2 text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1 text-xs text-slate-400 flex-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kanwil Kemenag</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600">Kalimantan Barat</span>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-700 leading-tight max-w-[140px] truncate">
                  {user?.displayName ?? user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-slate-400 leading-tight">{ROLE_LABEL[role]}</p>
              </div>
              <ChevronDown className={clsx('w-3.5 h-3.5 text-slate-400 transition-transform hidden sm:block', dropdownOpen && 'rotate-180')} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {user?.displayName ?? user?.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      {user?.npsn && <p className="text-xs text-slate-400 truncate">NPSN: {user.npsn}</p>}
                      <span className={clsx('inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-1', ROLE_COLOR[role])}>
                        <Shield className="w-2.5 h-2.5" />{ROLE_LABEL[role]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-1.5">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                    <LogOut className="w-4 h-4" />Keluar dari Akun
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6"><Outlet /></main>
      </div>
    </div>
  );
}
