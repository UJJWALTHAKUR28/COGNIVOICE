"use client";

import React from "react";
import { FaHome, FaMicrophone, FaYoutube } from "react-icons/fa";
import Link from "next/link";
import { GiSoundWaves } from "react-icons/gi";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const NavLink = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon?: React.ElementType;
    label: string;
  }) => (
    <Link
      href={href}
      className={`flex items-center hover:text-yellow-400 transition-colors ${
        pathname === href ? "text-yellow-400" : ""
      }`}
    >
      {Icon && <Icon className="mr-2" />}
      {label}
    </Link>
  );

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <nav className="bg-white text-black p-4 flex justify-between items-center border-b border-teal-600">
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
              <NavLink
                href="/voicecontiousRecording"
                icon={GiSoundWaves}
                label="MoodStream"
              />
              <NavLink
                href="/youtube-emotion"
                icon={FaYoutube}
                label="YouTube VoiceScan"
              />
              <button
                onClick={handleLogout}
                className="ml-4 hover:text-red-500 font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink href="/login" label="Login" />
              <NavLink href="/signup" label="Signup" />
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
