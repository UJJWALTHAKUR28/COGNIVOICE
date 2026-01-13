"use client";

import React from 'react';
import { FaGithub } from 'react-icons/fa';
import { GiSoundWaves } from 'react-icons/gi';
import { BiCopyright } from 'react-icons/bi';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-slate-950 border-t border-slate-800 text-slate-300 overflow-hidden relative w-full">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand Section */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <GiSoundWaves className="text-xl text-white" />
              </div>
              <h3 className="ml-3 text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent font-sans tracking-tight">
                Cognivoice
              </h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Pioneering the future of emotional intelligence through advanced voice analysis.
              Our AI-powered platform decodes human sentiment in real-time alongside you.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm tracking-wider uppercase border-b border-teal-500/30 pb-2 inline-block">
              Platform
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="group flex items-center text-slate-400 hover:text-teal-400 transition-colors text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 mr-2 group-hover:bg-teal-400 transition-colors"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/voice" className="group flex items-center text-slate-400 hover:text-teal-400 transition-colors text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 mr-2 group-hover:bg-teal-400 transition-colors"></span>
                  PulseTap Detection
                </Link>
              </li>
              <li>
                <Link href="/voicecontiousRecording" className="group flex items-center text-slate-400 hover:text-teal-400 transition-colors text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 mr-2 group-hover:bg-teal-400 transition-colors"></span>
                  MoodStream
                </Link>
              </li>
              <li>
                <Link href="/youtube-emotion" className="group flex items-center text-slate-400 hover:text-teal-400 transition-colors text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 mr-2 group-hover:bg-teal-400 transition-colors"></span>
                  YouTube VoiceScan
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm tracking-wider uppercase border-b border-cyan-500/30 pb-2 inline-block">
              Connect
            </h4>
            <div className="flex gap-4">
              {[
                { icon: FaGithub, label: 'GitHub', href: 'https://github.com/UJJWALTHAKUR28/COGNIVOICE' },

              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-teal-500 hover:bg-teal-500/10 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-xs flex items-center">
            <BiCopyright className="mr-1" />
            {currentYear} Cognivoice. All rights reserved.
          </div>

          <div className="flex items-center text-xs text-slate-500 font-medium">
            <span>Powered by </span>
            <span className="text-teal-400 mx-1">Next.js</span>
            <span>&</span>
            <span className="text-cyan-400 ml-1">AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;