"use client";

import React from "react";
import { FaGithub, FaTwitter, FaLinkedin, FaHeart, FaMicrophone } from "react-icons/fa";
import { GiSoundWaves } from "react-icons/gi";
import { BiCopyright } from "react-icons/bi";
import Link from "next/link";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-white border-t border-teal-400 overflow-hidden relative w-full">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="relative">
                <GiSoundWaves className="text-3xl text-teal-600 animate-pulse" />
                <div className="absolute inset-0 text-3xl text-teal-400 animate-ping opacity-20">
                  <GiSoundWaves />
                </div>
              </div>
              <h3 className="ml-3 text-2xl font-bold bg-gradient-to-r from-teal-900 via-teal-600 to-teal-800 bg-clip-text text-transparent font-mono">
                Cognivoice
              </h3>
            </div>
            <p className="text-teal-700/80 text-sm leading-relaxed mb-4">
              Advanced voice emotion detection powered by AI. Experience real-time emotional intelligence
              through cutting-edge audio analysis and machine learning algorithms.
            </p>
            <div className="flex items-center text-teal-600/70 text-xs">
              <span>Made with</span>
              <FaHeart className="mx-2 text-red-400 animate-pulse" />
              <span>for emotional AI innovation</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-teal-800 font-semibold mb-4 text-sm tracking-wide uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-teal-600/80 hover:text-teal-700 text-sm flex items-center">
                  <div className="w-1 h-1 bg-teal-400 rounded-full mr-2 opacity-60"></div>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/voice" className="text-teal-600/80 hover:text-teal-700 text-sm flex items-center">
                  <FaMicrophone className="mr-2 text-xs text-teal-500" />
                  PulseTap
                </Link>
              </li>
              <li>
                <Link
                  href="/voicecontiousRecording"
                  className="text-teal-600/80 hover:text-teal-700 text-sm flex items-center"
                >
                  <GiSoundWaves className="mr-2 text-xs text-teal-500" />
                  MoodStream
                </Link>
              </li>
              <li>
                <Link
                  href="/youtube-emotion"
                  className="text-teal-600/80 hover:text-teal-700 text-sm flex items-center"
                >
                  <div className="w-1 h-1 bg-teal-400 rounded-full mr-2 opacity-60"></div>
                  YouTube VoiceScan
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h4 className="text-teal-800 font-semibold mb-4 text-sm tracking-wide uppercase">
              Connect
            </h4>
            <div className="flex space-x-3">
              <a href="#" aria-label="GitHub" className="w-8 h-8 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center hover:from-teal-200 hover:to-teal-300 transition-all duration-300 transform hover:scale-110 shadow-sm">
                <FaGithub className="text-teal-700 text-sm" />
              </a>
              <a href="#" aria-label="Twitter" className="w-8 h-8 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-full flex items-center justify-center hover:from-cyan-200 hover:to-cyan-300 transition-all duration-300 transform hover:scale-110 shadow-sm">
                <FaTwitter className="text-cyan-700 text-sm" />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-8 h-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center hover:from-teal-200 hover:to-cyan-200 transition-all duration-300 transform hover:scale-110 shadow-sm">
                <FaLinkedin className="text-teal-700 text-sm" />
              </a>
            </div>
            <div className="mt-4 flex items-center">
              <div className="relative">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 bg-green-300 rounded-full animate-ping opacity-50"></div>
              </div>
              <span className="ml-2 text-xs text-teal-600/70">Services Online</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-teal-900/60">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-teal-600/60 text-xs mb-3 md:mb-0">
              <BiCopyright className="mr-1" />
              <span>{currentYear} Cognivoice. All rights reserved.</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-teal-600/60">Powered by</span>
              <div className="px-2 py-1 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-full border border-teal-100">
                <span className="text-xs font-medium bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">
                  AI • Next.js • React
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 opacity-60"></div>
    </footer>
  );
};

export default Footer;
