"use client";

import React, { useState } from "react";
import useRequireAuth from "@/context/useRequireAuth";

const YouTubeEmotionPage = () => {
  const user = useRequireAuth();
  const [link, setLink] = useState("");
  const [emotion, setEmotion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [processingStage, setProcessingStage] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  if (!user) return null;

  // Emotion color helper
  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: "#FFD700",
      sad: "#4169E1",
      angry: "#FF4500",
      fearful: "#800080",
      surprised: "#FF69B4",
      disgust: "#228B22",
      calm: "#20B2AA",
      neutral: "#808080",
    };
    return colors[emotion.toLowerCase()] || "#808080";
  };

  const isValidYouTubeUrl = (url: string) =>
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url);

  const handleLinkChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLink = e.target.value.trim();
    setLink(newLink);
    setError("");
    setEmotion("");

    if (!newLink) return;
    if (!isValidYouTubeUrl(newLink)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setIsProcessing(true);
    setProcessingStage("Downloading video...");

    try {
      // Simulate stages visually (optional)
      setTimeout(() => setProcessingStage("Extracting audio..."), 1000);
      setTimeout(() => setProcessingStage("Analyzing emotion..."), 2500);

      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/predict-emotion-youtube`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ youtube_url: newLink }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || "Error processing the link. Please try again.");
      }

      const data = await res.json();
      setEmotion(data.emotion);
      setProcessingStage("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error processing the link. Please try again.";
      setError(message);
      setProcessingStage("");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative animated blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-teal-100 rounded-full animate-pulse opacity-70" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-cyan-100 rounded-full animate-bounce opacity-70" />
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-teal-200 rounded-full animate-ping opacity-70" />
        <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-cyan-200 rounded-full animate-pulse opacity-70" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent mb-2 tracking-tight">
            YouTube VoiceScan
          </h1>
          <p className="text-xl text-teal-600/80 font-medium tracking-wide">
            Analyze emotions from YouTube videos
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-teal-100 relative overflow-hidden">
          <div className="relative z-10">
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
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-teal-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  } ${isProcessing ? "bg-gray-50 cursor-not-allowed" : "bg-white hover:border-teal-300"}`}
                  placeholder="https://www.youtube.com/watch?v=example"
                />
                {isProcessing && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-red-600 text-sm font-medium text-center">{error}</p>
              </div>
            )}

            {isProcessing && (
              <div className="mb-6 p-6 bg-teal-50 rounded-2xl border border-teal-100">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-2 border-teal-200 rounded-full animate-spin" />
                      <div className="absolute inset-2 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full animate-pulse" />
                      <div className="absolute inset-6 bg-white rounded-full animate-ping" />
                    </div>
                  </div>
                  <p className="text-teal-700 font-semibold mb-2">Processing Video</p>
                  <p className="text-teal-600 text-sm">{processingStage}</p>
                </div>
              </div>
            )}

            {emotion && !isProcessing && (
              <div className="mb-6 p-6 bg-teal-50 rounded-2xl border border-teal-100 shadow-lg">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: `${getEmotionColor(emotion)}20` }}
                    >
                      <div
                        className="w-8 h-8 rounded-full animate-pulse"
                        style={{ backgroundColor: getEmotionColor(emotion) }}
                      />
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
                </div>
              </div>
            )}

            <div className="text-center text-teal-600/70 text-sm mt-4">
              <p>Paste a YouTube link above to analyze the emotional tone.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center max-w-md">
          <p className="text-teal-600/60 text-xs">
            Our AI processes YouTube audio to identify emotional patterns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default YouTubeEmotionPage;
