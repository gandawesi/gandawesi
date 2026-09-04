'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Compass,
  Menu,
  X,
  LogIn,
  LogOut,
  LayoutDashboard,
  User,
  Shield,
  ChevronDown,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { authUser, profile, isAdmin, isGuest, signOut, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const guestNavLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/tentang', label: 'Tentang' },
    { href: '/struktur', label: 'Struktur' },
    { href: '/artikel', label: 'Warta' },
    { href: '/ekspedisi', label: 'Ekspedisi' },
    { href: '/donasi', label: 'Sponsorship' },
    { href: '/daftar', label: 'Pendaftaran' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-stone-200/60 dark:border-stone-800/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-forest-800 dark:bg-forest-700 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-forest-200 animate-[spin_10s_linear_infinite]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-base text-stone-900 dark:text-stone-100 font-mono">
              GANDAWESI
            </span>
            <span className="text-[10px] tracking-tight text-forest-700 dark:text-forest-400 font-medium">
              MAPALA FPTI UPI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {guestNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-forest-800 dark:text-forest-300 bg-forest-50 dark:bg-forest-950/60 font-semibold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-stone-800/40'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {!isGuest && (
            <Link
              href="/dashboard"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname.startsWith('/dashboard')
                  ? 'text-forest-800 dark:text-forest-300 bg-forest-50 dark:bg-forest-950/60 font-semibold'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-stone-800/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-forest-600 dark:text-forest-400" />
              <span>Portal Anggota</span>
            </Link>
          )}
        </nav>

        {/* Auth / Profile Area */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 animate-pulse" />
          ) : isGuest || !authUser ? (
            <Link href="/login">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                Masuk
              </Button>
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800 transition-colors"
              >
                <div className="text-right flex flex-col items-end">
                  <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 leading-tight">
                    {profile?.nama || authUser.email?.split('@')[0] || 'Anggota'}
                  </span>
                  {profile?.status_keanggotaan ? (
                    <Badge status={profile.status_keanggotaan} size="sm" />
                  ) : isAdmin ? (
                    <span className="text-[10px] text-forest-600 font-bold uppercase">Admin</span>
                  ) : null}
                </div>
                <Avatar
                  src={profile?.foto_profil}
                  name={profile?.nama || authUser.email || 'User'}
                  size="sm"
                />
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-stone-200 dark:border-stone-800 p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800/80">
                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {profile?.nama || 'Akun Gandawesi'}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {authUser.email}
                    </p>
                    {profile?.nia && (
                      <p className="text-[10px] font-mono text-forest-700 dark:text-forest-400 font-semibold mt-0.5">
                        NIA: {profile.nia}
                      </p>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-forest-50 dark:hover:bg-forest-950/50 rounded-xl transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-forest-600" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profil"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-forest-50 dark:hover:bg-forest-950/50 rounded-xl transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-forest-600" />
                      Profil Saya
                    </Link>
                    <Link
                      href="/dashboard/direktori"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-forest-50 dark:hover:bg-forest-950/50 rounded-xl transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-forest-600 opacity-70" />
                      Direktori Anggota
                    </Link>
                    <Link
                      href="/dashboard/klaim"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-xl transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      Klaim Akun Anggota
                    </Link>
                    {isAdmin && (
                      <span className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl my-0.5">
                        <Shield className="w-3.5 h-3.5 text-amber-600" />
                        Akses Super Admin
                      </span>
                    )}
                  </div>

                  <div className="pt-1 border-t border-stone-100 dark:border-stone-800/80">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {!isGuest && authUser && (
            <Avatar
              src={profile?.foto_profil}
              name={profile?.nama || authUser.email || 'User'}
              size="sm"
            />
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-stone-800 px-4 pt-3 pb-5 bg-white/95 dark:bg-[#0f1814]/95 backdrop-blur-md space-y-2">
          {guestNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-stone-800 dark:text-stone-200 hover:bg-forest-50 dark:hover:bg-forest-950/50"
            >
              {link.label}
            </Link>
          ))}

          {!isGuest && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-forest-700 dark:text-forest-400 bg-forest-50 dark:bg-forest-950/50"
            >
              Portal Anggota
            </Link>
          )}

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
            {isGuest || !authUser ? (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full">
                  Masuk dengan Google
                </Button>
              </Link>
            ) : (
              <Button
                variant="danger"
                size="md"
                className="w-full"
                leftIcon={<LogOut className="w-4 h-4" />}
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
              >
                Keluar
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
