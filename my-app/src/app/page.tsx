"use client";
import React, { useState } from "react";
import { Mic, MicOff, Play, Heart, Brain, Zap, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

const CognivoiceHero: React.FC = () => {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);

  const handleRecord = () => {
    setIsRecording(true);
    router.push("/signup");
  };

  const handleFeatureClick = (featureTitle: string) => {
    const routes: Record<string, string> = {
      MoodStream: "/voicecontiousRecording",
      "YouTube VoiceScan": "/youtube-emotion",
      "Voice Emotion Detection": "/voice",
    };
    router.push(routes[featureTitle] || "/signup");
  };

  const features = [
    {
      title: "MoodStream",
      subtitle: "Real-Time Voice Intelligence at the Edge of Emotion",
      description:
        "Continuously captures, decodes, and interprets speech patterns and emotional tones—enabling responsive, human-aware interfaces powered by cognitive audio sensing.",
      icon: <Brain className="w-8 h-8" />,
      gradient: "from-purple-600 via-purple-500 to-indigo-500",
      bgGradient: "from-purple-50 to-indigo-50",
      borderColor: "border-purple-200",
    },
    {
      title: "YouTube VoiceScan",
      subtitle: "Analyze Emotions from Video Content",
      description:
        "AI-powered analysis of emotional undertones in YouTube videos. Extract mood patterns and insights from any video with precision.",
      icon: <Play className="w-8 h-8" />,
      gradient: "from-red-500 via-pink-500 to-rose-500",
      bgGradient: "from-red-50 to-pink-50",
      borderColor: "border-pink-200",
    },
    {
      title: "Voice Emotion Detection",
      subtitle: "Instant Audio Emotion Analysis",
      description:
        "Record 3 seconds of audio for immediate emotion detection. Our algorithms identify joy, sadness, anger, fear, and subtle emotional nuances in real-time.",
      icon: <Heart className="w-8 h-8" />,
      gradient: "from-teal-600 via-teal-500 to-cyan-500",
      bgGradient: "from-teal-50 to-cyan-50",
      borderColor: "border-cyan-200",
    },
  ];

  const stats = [
    { number: "99.2%", label: "Accuracy Rate", icon: <TrendingUp className="w-6 h-6" /> },
    { number: "150ms", label: "Response Time", icon: <Zap className="w-6 h-6" /> },
    { number: "12+", label: "Emotions Detected", icon: <Heart className="w-6 h-6" /> },
    { number: "24/7", label: "Real-time Processing", icon: <Brain className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div
          className="absolute top-20 left-20 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-40 right-20 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute -bottom-8 left-1/2 w-72 h-72 bg-slate-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Hero Header */}
        <div className="text-center mb-20">
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-teal-900 via-teal-600 to-cyan-500 bg-clip-text text-transparent font-mono tracking-tight relative inline-block">
            Cognivoice
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full opacity-70"></div>
          </h1>

          <h2 className="text-4xl font-semibold text-teal-800 mb-8 leading-tight">
            Understand Voices. Decode Emotions. Power Human-Centric AI
          </h2>

          <p className="text-xl text-teal-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            Your AI-powered voice emotion recognition platform that transforms audio into
            actionable emotional intelligence.
          </p>

          {/* Primary CTA */}
          <div className="flex justify-center mb-16">
            <button
              onClick={handleRecord}
              className={`group relative px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                isRecording
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-200"
                  : "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                <span>{isRecording ? "Recording..." : "Start Voice Analysis"}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group relative bg-gradient-to-br ${feature.bgGradient} p-8 rounded-3xl border ${feature.borderColor} shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2`}
            >
              {/* Background Glow */}
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500`}
              ></div>

              <div className="relative">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>

                <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors">
                  {feature.title}
                </h3>

                <h4 className="text-lg font-semibold text-slate-600 mb-4">
                  {feature.subtitle}
                </h4>

                <p className="text-slate-600 leading-relaxed mb-6">
                  {feature.description}
                </p>

                <button
                  onClick={() => handleFeatureClick(feature.title)}
                  className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r ${feature.gradient} text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
                >
                  Try {feature.title}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-teal-600 flex justify-center mb-2 group-hover:text-teal-700 transition-colors">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-1">{stat.number}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* About Section */}
        <div className="mt-20 text-center">
          <div className="max-w-4xl mx-auto bg-white/50 backdrop-blur-sm rounded-3xl p-12 border border-white/30 shadow-xl">
            <h3 className="text-3xl font-bold text-slate-800 mb-6">About Cognivoice</h3>
            <p className="text-lg text-slate-700 leading-relaxed">
              Cognivoice represents the next generation of emotional AI, combining advanced
              audio signal processing with machine learning to decode the subtle nuances of
              human emotion. Our platform empowers developers and businesses to build more
              empathetic, voice-aware systems.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed mt-4">
              From real-time mood monitoring to comprehensive video emotion analysis,
              Cognivoice bridges the gap between human emotion and artificial understanding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CognivoiceHero;
