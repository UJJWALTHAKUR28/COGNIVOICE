"use client";

import React, { useEffect, useState } from 'react';
import { FaHome, FaMicrophone, FaYoutube, FaSun, FaMoon, FaInfoCircle } from 'react-icons/fa';
import Link from 'next/link';
import { GiSoundWaves } from 'react-icons/gi';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/authContext';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  // Enhanced NavLink with Pill shape hover effect
  const NavLink = ({ href, icon: Icon, label }: { href: string; icon?: React.ElementType; label: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 
          ${isActive
            ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
            : 'text-slate-600 hover:bg-slate-100 hover:text-teal-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-teal-400'
          }`}
      >
        {Icon && <Icon className={`mr-2 text-lg ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />}
        {label}
      </Link>
    );
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b backdrop-blur-xl
      border-slate-200 bg-white/90 
      dark:border-slate-800 dark:bg-slate-950/80">

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">

        {/* Logo Section */}
        <Link href="/" className="group flex items-center space-x-2.5">
          <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 dark:from-teal-500 dark:to-cyan-600 shadow-md group-hover:shadow-teal-500/30 transition-shadow">
            <GiSoundWaves className="text-white text-xl animate-pulse" style={{ animationDuration: '3s' }} />
          </div>
          <h1 className="text-xl font-bold tracking-tight
            text-slate-800 
            dark:bg-gradient-to-r dark:from-teal-200 dark:to-cyan-400 dark:bg-clip-text dark:text-transparent">
            Cognivoice
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          <NavLink href="/" icon={FaHome} label="Home" />
          <NavLink href="/about" icon={FaInfoCircle} label="About" />

          {user ? (
            <>
              {/* Divider */}
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

              <NavLink href="/voice" icon={FaMicrophone} label="PulseTap" />
              <NavLink href="/voicecontiousRecording" icon={GiSoundWaves} label="MoodStream" />
              <NavLink href="/youtube-emotion" icon={FaYoutube} label="YouTube" />

              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Divider */}
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors dark:text-slate-300 dark:hover:text-teal-400"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="ml-2 px-5 py-2 rounded-full text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition-all hover:scale-105 hover:shadow-teal-500/40
                bg-gradient-to-r from-teal-500 to-emerald-500 
                dark:from-teal-500 dark:to-cyan-600"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="ml-4 p-2.5 rounded-full transition-all duration-300
              text-slate-500 hover:bg-slate-100 hover:text-orange-500 hover:rotate-12
              dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-yellow-400"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === 'dark' ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />
            ) : (
              <div className="w-5 h-5" /> // Placeholder to prevent layout shift
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;