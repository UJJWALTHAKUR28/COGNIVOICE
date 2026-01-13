"use client";
import React, { useState } from 'react';
import useRequireAuth from "@/context/useRequireAuth";
import { API_URL } from '@/config/api';
import { FaYoutube, FaSearch, FaMagic } from 'react-icons/fa'; // Added icons for better UI

const YouTubeEmotionPage = () => {
  const user = useRequireAuth();

  const [link, setLink] = useState('');
  const [emotion, setEmotion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [processingStage, setProcessingStage] = useState('');

  const getEmotionColor = (emotion: string) => {
    const colors = {
      'happy': '#FACC15', // Yellow-400 (Brighter for dark mode)
      'sad': '#60A5FA',   // Blue-400
      'angry': '#F87171', // Red-400
      'fearful': '#C084FC', // Purple-400
      'surprised': '#F472B6', // Pink-400
      'disgust': '#4ADE80', // Green-400
      'calm': '#2DD4BF',    // Teal-400
      'neutral': '#94A3B8'  // Slate-400
    };
    return colors[(emotion?.toLowerCase() as keyof typeof colors)] || '#94A3B8';
  };

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleLinkChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLink = e.target.value;
    setLink(newLink);
    setError('');

    if (!newLink.trim()) {
      setEmotion('');
      return;
    }

    if (!isValidYouTubeUrl(newLink)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setIsProcessing(true);
    setEmotion('');
    setProcessingStage('Downloading video...');

    try {
      setTimeout(() => setProcessingStage('Extracting audio...'), 1000);
      setTimeout(() => setProcessingStage('Analyzing emotion...'), 2500);

      const res = await fetch(`${API_URL}/predict-emotion-youtube`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ youtube_url: newLink })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Error processing the link. Please try again.');
      }

      const data = await res.json();
      setEmotion(data.emotion);
      setProcessingStage('');

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Error processing the link. Please try again.');
      } else {
        setError('Error processing the link. Please try again.');
      }
      setProcessingStage('');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500 bg-slate-50 dark:bg-slate-950 flex flex-col justify-center">

      {/* --- Ambient Background Glows --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-12">

        {/* --- Header Section --- */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30 mb-4 transform hover:rotate-6 transition-transform">
            <FaYoutube className="text-white text-3xl" />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400">
              YouTube VoiceScan
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Paste a link below to extract audio and visualize the underlying emotions.
          </p>
        </div>

        {/* --- Main Glass Card --- */}
        <div className="backdrop-blur-xl rounded-3xl p-1 shadow-2xl transition-all duration-300 bg-gradient-to-b from-white/60 to-white/30 border border-white/50 dark:from-slate-900/60 dark:to-slate-900/30 dark:border-slate-700/50">

          <div className="bg-white/50 dark:bg-slate-950/50 rounded-[1.3rem] p-6 md:p-8 relative overflow-hidden">

            {/* Shimmer Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -skew-x-12 animate-shimmer pointer-events-none" />

            {/* --- Input Field --- */}
            <div className="relative z-10 space-y-6">
              <div className="group relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaSearch className="text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  )}
                </div>

                <input
                  type="text"
                  value={link}
                  onChange={handleLinkChange}
                  disabled={isProcessing}
                  placeholder="Paste YouTube URL here..."
                  className={`w-full pl-12 pr-4 py-4 rounded-xl text-lg outline-none transition-all duration-300
                    bg-slate-50 dark:bg-slate-900 
                    border-2 
                    ${error
                      ? 'border-red-300 dark:border-red-900/50 focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                      : 'border-slate-200 dark:border-slate-800 focus:border-teal-500 dark:focus:border-teal-400 focus:shadow-[0_0_20px_rgba(20,184,166,0.2)]'
                    }
                    text-slate-800 dark:text-slate-100 placeholder:text-slate-400
                    disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>

              {/* --- Error Message --- */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center animate-fadeIn">
                  <p className="text-red-600 dark:text-red-300 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* --- Processing State --- */}
              {isProcessing && (
                <div className="text-center py-8 animate-fadeIn">
                  <div className="w-full max-w-xs mx-auto space-y-4">
                    <p className="text-teal-600 dark:text-teal-400 font-medium animate-pulse">{processingStage}</p>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 animate-progress rounded-full"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- Result Card --- */}
              {emotion && !isProcessing && (
                <div className="mt-8 animate-slideIn">
                  <div className="relative overflow-hidden rounded-2xl p-6 text-center border transition-all duration-300 border-slate-100 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50">

                    {/* Emotion Glow Behind */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl opacity-20 dark:opacity-30"
                      style={{ backgroundColor: getEmotionColor(emotion) }}
                    />

                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mb-4 transition-transform hover:scale-105"
                        style={{ backgroundColor: `${getEmotionColor(emotion)}20` }}
                      >
                        <FaMagic className="text-3xl" style={{ color: getEmotionColor(emotion) }} />
                      </div>

                      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                        Detected Mood
                      </h3>
                      <p
                        className="text-4xl font-black capitalize tracking-tight drop-shadow-sm"
                        style={{ color: getEmotionColor(emotion) }}
                      >
                        {emotion}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          AI Analysis powered by Cognivoice Engine
        </p>
      </div>

      {/* --- Styles for Animations --- */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-12deg); }
          100% { transform: translateX(150%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite linear;
        }
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s infinite ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); scale: 0.95; }
          to { opacity: 1; transform: translateY(0); scale: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default YouTubeEmotionPage;