"use client";
import React, { useEffect, useState } from 'react';
import useRequireAuth from "@/context/useRequireAuth";

const YouTubeEmotionPage = () => {
  const user = useRequireAuth();
  if (!user) return null;

  const [link, setLink] = useState('');
  const [emotion, setEmotion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [processingStage, setProcessingStage] = useState('');
   const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";;
  const getEmotionColor = (emotion: string) => {
    const colors = {
      'happy': '#FFD700',
      'sad': '#4169E1',
      'angry': '#FF4500',
      'fearful': '#800080',
      'surprised': '#FF69B4',
      'disgust': '#228B22',
      'calm': '#20B2AA',
      'neutral': '#808080'
    };
    return colors[(emotion?.toLowerCase() as keyof typeof colors)] || '#808080';
  };

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleLinkChange = async (e: { target: { value: any; }; }) => {
    const newLink = e.target.value;
    setLink(newLink);
    setError('');
    
    // Don't process if the input is empty or not a valid YouTube URL
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
      // Simulate processing stages
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
      console.log("Emotion prediction data:", data);
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

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-teal-100 to-teal-200 rounded-full mix-blend-multiply animate-pulse opacity-70"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-cyan-100 to-cyan-200 rounded-full mix-blend-multiply animate-bounce opacity-70"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-r from-teal-200 to-teal-300 rounded-full mix-blend-multiply animate-ping opacity-70"></div>
        <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-gradient-to-r from-cyan-200 to-cyan-300 rounded-full mix-blend-multiply animate-pulse opacity-70"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent mb-2 tracking-tight">
            YouTube VoiceScan
          </h1>
          <p className="text-xl text-teal-600/80 font-medium tracking-wide">
            Analyze emotions from YouTube videos
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-teal-100 relative overflow-hidden">
          {/* Card Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-shimmer"></div>
          
          <div className="relative z-10">
            {/* Input Section */}
            <div className="mb-6">
              <label className="block text-teal-700 text-sm font-semibold mb-3 text-center">
                Enter YouTube Link
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={link}
                  onChange={handleLinkChange}
                  disabled={isProcessing}
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-gray-700 ${
                    error 
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-teal-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
                  } ${isProcessing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:border-teal-300'}`}
                  placeholder="https://www.youtube.com/watch?v=example"
                />
                
                {/* Loading indicator in input */}
                {isProcessing && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 backdrop-blur-sm animate-fadeIn">
                <p className="text-red-600 text-sm font-medium text-center">{error}</p>
              </div>
            )}

            {/* Processing Status */}
            {isProcessing && (
              <div className="mb-6 p-6 bg-gradient-to-br from-teal-50/80 to-cyan-50/80 rounded-2xl border border-teal-100 backdrop-blur-sm">
                <div className="text-center">
                  {/* Processing Animation */}
                  <div className="mb-4 flex justify-center">
                    <div className="relative w-16 h-16">
                      {/* Outer rotating ring */}
                      <div className="absolute inset-0 border-2 border-teal-200 rounded-full animate-spin"></div>
                      {/* Inner pulsing circle */}
                      <div className="absolute inset-2 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full animate-pulse"></div>
                      {/* Center dot */}
                      <div className="absolute inset-6 bg-white rounded-full animate-ping"></div>
                    </div>
                  </div>
                  
                  <p className="text-teal-700 font-semibold mb-2">Processing Video</p>
                  <p className="text-teal-600 text-sm">{processingStage}</p>
                  
                  {/* Progress bar */}
                  <div className="mt-4 h-2 bg-teal-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full animate-progress"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Emotion Result */}
            {emotion && !isProcessing && (
              <div className="mb-6 p-6 bg-gradient-to-br from-teal-50/80 to-cyan-50/80 rounded-2xl border border-teal-100 backdrop-blur-sm shadow-lg transform transition-all duration-500 animate-slideIn">
                <div className="text-center">
                  {/* Emotion Icon */}
                  <div className="mb-4 flex justify-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: `${getEmotionColor(emotion)}20` }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full animate-pulse"
                        style={{ backgroundColor: getEmotionColor(emotion) }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-teal-600/80 text-sm mb-2 font-medium tracking-wide">
                    Detected Emotion:
                  </p>
                  <p 
                    className="text-3xl font-bold capitalize tracking-wide drop-shadow-sm mb-3"
                    style={{ color: getEmotionColor(emotion) }}
                  >
                    {emotion}
                  </p>
                  
                  {/* Emotion strength bar */}
                  <div className="h-1 bg-teal-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        background: `linear-gradient(90deg, ${getEmotionColor(emotion)}, ${getEmotionColor(emotion)}80)`,
                        width: '100%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="text-center text-teal-600/70 text-sm space-y-1">
              <p className="font-medium">Paste a YouTube link above</p>
              <p>to analyze the emotional content</p>
              <div className="flex justify-center gap-2 mt-3">
                <div className="w-2 h-2 bg-teal-300 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse animation-delay-100"></div>
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse animation-delay-200"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center max-w-md">
          <p className="text-teal-600/60 text-xs">
            Our AI analyzes the audio from YouTube videos to detect emotional patterns and sentiment.
          </p>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 60%;
          }
          100% {
            width: 100%;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default YouTubeEmotionPage;
