"use client";
import React from 'react';
import { Brain, Mic, Play, Zap, Heart, TrendingUp, Shield, Users } from 'lucide-react';
import Link from 'next/link';

const AboutPage = () => {
    const features = [
        {
            icon: <Brain className="w-8 h-8" />,
            title: "Advanced AI Models",
            description: "Powered by state-of-the-art deep learning models trained on diverse emotional speech datasets for accurate emotion recognition."
        },
        {
            icon: <Mic className="w-8 h-8" />,
            title: "Real-Time Analysis",
            description: "Process voice input in real-time with sub-second latency, enabling immediate emotional feedback and insights."
        },
        {
            icon: <Play className="w-8 h-8" />,
            title: "Multi-Source Support",
            description: "Analyze emotions from live recordings, uploaded audio files, and even YouTube video content seamlessly."
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Privacy First",
            description: "Your audio data is processed securely and never stored without your consent. We prioritize your privacy."
        }
    ];

    const techStack = [
        { name: "Next.js 15", category: "Frontend" },
        { name: "React 18", category: "Frontend" },
        { name: "TailwindCSS", category: "Styling" },
        { name: "FastAPI", category: "Backend" },
        { name: "Python", category: "Backend" },
        { name: "TensorFlow/PyTorch", category: "AI/ML" },
        { name: "Librosa", category: "Audio Processing" },
        { name: "MongoDB", category: "Database" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-teal-200 dark:bg-teal-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-30 animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-200 dark:bg-cyan-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-30 animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 container mx-auto px-6 py-20">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-teal-900 via-teal-600 to-cyan-500 dark:from-teal-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
                            About Cognivoice
                        </h1>
                        <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed mb-8">
                            Cognivoice is an AI-powered voice emotion recognition platform that transforms audio into actionable emotional intelligence.
                            We help developers, researchers, and businesses build more empathetic and human-centered applications.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link
                                href="/signup"
                                className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-2xl hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                Get Started
                            </Link>
                            <Link
                                href="/"
                                className="px-8 py-4 bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-semibold rounded-2xl border border-teal-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-slate-700 transition-all"
                            >
                                Explore Features
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="container mx-auto px-6 py-16">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl p-12 border border-white/30 dark:border-slate-700/30 shadow-xl max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-6 text-center">Our Mission</h2>
                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed text-center">
                        We believe that technology should understand not just what people say, but how they feel.
                        Cognivoice bridges the gap between human emotion and digital interaction, enabling applications
                        that respond with empathy and intelligence. Our goal is to make emotional AI accessible to everyone.
                    </p>
                </div>
            </div>

            {/* Features Grid */}
            <div className="container mx-auto px-6 py-16">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-12 text-center">What We Offer</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center mb-4 shadow-lg">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{feature.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tech Stack */}
            <div className="container mx-auto px-6 py-16">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-12 text-center">Built With</h2>
                <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                    {techStack.map((tech, index) => (
                        <div
                            key={index}
                            className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-teal-200 dark:border-slate-700 shadow-sm"
                        >
                            <span className="text-teal-700 dark:text-teal-400 font-medium text-sm">{tech.name}</span>
                            <span className="text-slate-400 dark:text-slate-500 text-xs ml-2">({tech.category})</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                    {[
                        { number: '99.2%', label: 'Accuracy', icon: <TrendingUp className="w-6 h-6" /> },
                        { number: '150ms', label: 'Latency', icon: <Zap className="w-6 h-6" /> },
                        { number: '12+', label: 'Emotions', icon: <Heart className="w-6 h-6" /> },
                        { number: '1000+', label: 'Users', icon: <Users className="w-6 h-6" /> }
                    ].map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-lg">
                                <div className="text-teal-600 dark:text-teal-400 flex justify-center mb-2">
                                    {stat.icon}
                                </div>
                                <div className="text-3xl font-bold text-slate-800 dark:text-white">{stat.number}</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="container mx-auto px-6 py-20">
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl p-12 text-center shadow-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
                    <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
                        Join thousands of developers and researchers using Cognivoice to build emotionally intelligent applications.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-block px-8 py-4 bg-white text-teal-600 font-semibold rounded-2xl hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl"
                    >
                        Create Free Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
