"use client";

import React, { useEffect, useState } from 'react';
import { FaHome, FaMicrophone, FaHistory, FaCog ,FaYoutube} from 'react-icons/fa';
import Link from 'next/link';
import { GiSoundWaves } from 'react-icons/gi';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/authContext';
import PulseMicIcon from './PulseMIicon';
const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark'); // Adjust type as needed
  const { user, logout } = useAuth(); // <-- Use context
  useEffect(() => {
    // Sync theme when component mounts
    setIsDarkMode(theme === 'dark');
  }, [theme]);


  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setTheme(newTheme);
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    logout(); // <-- Use context logout
    router.replace("/login");
  };

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon?: React.ElementType; label: string }) => (
    <Link
      href={href}
      className={`flex items-center hover:text-yellow-400 transition-colors ${
        pathname === href ? 'text-yellow-400' : ''
      }`}
    >
      {Icon && <Icon className="mr-2" />}
      {label}
    </Link>
  );

  return (
    <header className='fixed top-0 left-0 w-full z-50 bg-white shadow-md'>
      <nav className="bg-white dark:bg-gray-900 text-black dark:text-white p-4 flex justify-between items-center border-b border-teal-600">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-900 via-teal-500 to-teal-800 bg-clip-text text-transparent font-mono">
            Cognivoice
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          <NavLink href="/" icon={FaHome} label="Home" />
          {user ? (
            <>
              <NavLink href="/voice" icon={FaMicrophone} label="PulseTap" />
              <NavLink href="/voicecontiousRecording" icon={GiSoundWaves} label="MoodStream" />
              <NavLink href="/youtube-emotion" icon={FaYoutube} label="YouTube VoiceScan" />
              <button onClick={handleLogout} className="ml-4 hover:text-red-500 font-semibold">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink href="/login" label="Login" />
              <NavLink href="/signup" label="Signup" />
            </>
          )}
          <button
            onClick={toggleTheme}
            className="ml-4 border px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
