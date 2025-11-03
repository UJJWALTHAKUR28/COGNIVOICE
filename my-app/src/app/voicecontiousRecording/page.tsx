"use client";
import { useState, useRef, useEffect } from 'react';
import useRequireAuth from "@/context/useRequireAuth";

export default function VoiceEmotionDetection() {
  const user = useRequireAuth();
  if (!user) return null;

  // State Hooks
  const [isRecording, setIsRecording] = useState(false);
  const [emotion, setEmotion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [emotionHistory, setEmotionHistory] = useState<string[]>([]);

  // Ref Hooks for stable references across renders
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shouldContinueRecordingRef = useRef(false);

  // Backend API URL
  const API_URL =  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // --- Core Functions ---

  /**
   * Cleans up all audio resources and resets state.
   */
  const cleanupResources = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (processingIntervalRef.current) clearInterval(processingIntervalRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    animationFrameRef.current = null;
    processingIntervalRef.current = null;
    streamRef.current = null;
    mediaRecorderRef.current = null;
    audioContextRef.current = null;
    audioChunksRef.current = [];
  };

  /**
   * Processes the collected audio chunks and sends them to backend.
   */
  const processAndPredict = async () => {
    if (audioChunksRef.current.length === 0) return;

    setIsProcessing(true);
    setError('');

    const combinedBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
    audioChunksRef.current = [];

    if (combinedBlob.size < 1000) {
      setIsProcessing(false);
      return;
    }

    try {
      const audioArray = await processAudioForBackend(combinedBlob);
      if (audioArray) {
        const predictedEmotion = await sendAudioToBackend(audioArray);
        if (predictedEmotion) {
          setEmotion(predictedEmotion);
          setEmotionHistory(prev => [...prev, predictedEmotion].slice(-5));
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error("Error during prediction:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Start recording and prediction loop.
   */
  const startRecording = async () => {
    shouldContinueRecordingRef.current = true;
    setIsRecording(true);
    setError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 22050,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      streamRef.current = stream;

      // Setup audio visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      updateAudioVisualizer();

      const mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        throw new Error("WebM Opus audio format not supported.");
      }

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        await processAndPredict();
        if (shouldContinueRecordingRef.current) {
          mediaRecorderRef.current?.start();
        }
      };

      mediaRecorderRef.current.start();

      processingIntervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 6000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording.';
      console.error("Start recording error:", errorMessage);
      setError(errorMessage);
      setIsRecording(false);
      cleanupResources();
    }
  };

  /**
   * Stop recording and cleanup.
   */
  const stopRecording = () => {
    shouldContinueRecordingRef.current = false;
    setIsRecording(false);
    setAudioLevel(0);
    cleanupResources();
  };

  // --- Helper & Utility Functions ---

  const processAudioForBackend = (audioBlob: Blob): Promise<number[] | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          if (!e.target?.result) return resolve(null);
          
          const arrayBuffer = e.target.result as ArrayBuffer;
          const tempAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 22050 });
          
          const audioBuffer = await tempAudioContext.decodeAudioData(arrayBuffer);
          const audioData = audioBuffer.getChannelData(0);
          const targetLength = 22050 * 6;
          const audioArray = Array.from(audioData);
          
          if (audioArray.length < targetLength) {
            audioArray.push(...new Array(targetLength - audioArray.length).fill(0));
          } else {
            audioArray.length = targetLength;
          }

          await tempAudioContext.close();
          resolve(audioArray);
        } catch (error) {
          console.error('Error processing audio chunk:', error);
          reject(new Error("Unable to decode audio data. The audio chunk may be corrupted."));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(audioBlob);
    });
  };

  const sendAudioToBackend = async (audioArray: number[]) => {
    const response = await fetch(`${API_URL}/predict-emotion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_data: audioArray }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const result = await response.json();
    return result.emotion || result.prediction;
  };
  
  const updateAudioVisualizer = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(average);
    }
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateAudioVisualizer);
    }
  };
  
  const getEmotionColor = (emotionStr: string) => {
    const colors: Record<string, string> = { 
      happy: '#FFD700', 
      sad: '#4169E1', 
      angry: '#FF4500', 
      fearful: '#800080', 
      surprised: '#FF69B4', 
      disgust: '#228B22', 
      calm: '#20B2AA', 
      neutral: '#808080' 
    };
    return colors[emotionStr?.toLowerCase()] || '#808080';
  };

  useEffect(() => {
    return () => cleanupResources();
  }, []);

  // --- JSX ---
  return (
    <>
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-teal-100 to-teal-200 rounded-full mix-blend-multiply animate-pulse opacity-70"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-cyan-100 to-cyan-200 rounded-full mix-blend-multiply animate-bounce opacity-70"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-r from-teal-200 to-teal-300 rounded-full mix-blend-multiply animate-ping opacity-70"></div>
          <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-gradient-to-r from-cyan-200 to-cyan-300 rounded-full mix-blend-multiply animate-pulse opacity-70"></div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 text-center pt-8 pb-10 px-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4 tracking-tight">
            MoodStream
          </h1>
          <h2 className="text-xl md:text-2xl text-teal-700 font-semibold mb-6 tracking-wide">
            Real-Time Voice Intelligence at the Edge of Emotion
          </h2>
          <p className="text-teal-600/80 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
            MoodStream continuously captures, decodes, and interprets speech patterns and emotional tones—enabling responsive, human-aware interfaces powered by cognitive audio sensing.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-center px-3 pb-8">
          
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full shadow-2xl border border-teal-100 relative overflow-hidden">
            {/* Card Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-shimmer"></div>
            
            <div className="text-center relative z-10">
              {/* Header - Compact */}
              <div className="mb-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent mb-1 tracking-tight">
                  Voice Emotion
                </h1>
                <h2 className="text-lg text-teal-600/80 font-medium tracking-wide">Detection</h2>
                <div className="mt-1 text-sm text-teal-500/70">Continuous Real-time Analysis</div>
              </div>

              {/* Audio Level Visualizer - Smaller when not recording */}
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  {/* Outer rotating ring - only when recording */}
                  {isRecording && (
                    <div className="absolute inset-0 w-32 h-32 border-2 border-teal-200 rounded-full animate-spin"></div>
                  )}
                  
                  {/* Main visualizer container - smaller when not recording */}
                  <div className={`${isRecording ? 'w-32 h-32' : 'w-24 h-24'} rounded-full border-4 border-teal-300/50 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50 shadow-lg transition-all duration-300`}>
                    
                    {/* Audio level visualization */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-teal-400 to-cyan-400 transition-all duration-100 opacity-80"
                      style={{ 
                        transform: `translateY(${100 - (audioLevel / 255) * 100}%)`,
                        opacity: isRecording ? 0.8 : 0.2
                      }}
                    />
                    
                    {/* Center indicator */}
                    <div className="relative z-10 flex items-center justify-center">
                      {isRecording ? (
                        <div className="relative">
                          <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                          <div className="absolute inset-0 w-6 h-6 bg-red-400 rounded-full animate-ping"></div>
                        </div>
                      ) : isProcessing ? (
                        <div className="w-6 h-6 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full shadow-lg flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>

                    {/* Ripple effect when recording */}
                    {isRecording && (
                      <>
                        <div className="absolute inset-0 border-4 border-teal-400 rounded-full animate-ping opacity-20"></div>
                        <div className="absolute inset-2 border-2 border-cyan-400 rounded-full animate-ping opacity-30 animation-delay-300"></div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Emotion Display - Conditional height */}
              {emotion && (
                <div className="mb-4">
                  <div className="p-4 bg-gradient-to-br from-teal-50/80 to-cyan-50/80 rounded-2xl border border-teal-100 backdrop-blur-sm shadow-lg transform transition-all duration-500 hover:scale-105">
                    <p className="text-teal-600/80 text-sm mb-1 font-medium tracking-wide">Current Emotion:</p>
                    <p 
                      className="text-2xl font-bold capitalize tracking-wide drop-shadow-sm"
                      style={{ color: getEmotionColor(emotion) }}
                    >
                      {emotion}
                    </p>
                    <div className="mt-2 h-1 bg-teal-100 rounded-full overflow-hidden">
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

              {/* Emotion History - Only show if exists */}
              {emotionHistory.length > 0 && (
                <div className="mb-4">
                  <p className="text-teal-600/70 text-xs mb-2 font-medium">Recent Emotions:</p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {emotionHistory.map((hist, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm"
                        style={{ 
                          color: getEmotionColor(hist),
                          backgroundColor: `${getEmotionColor(hist)}20`,
                          borderColor: `${getEmotionColor(hist)}40`
                        }}
                      >
                        {hist}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Messages - Compact */}
              {(isProcessing || error) && (
                <div className="mb-4">
                  {isProcessing && (
                    <div className="p-3 bg-gradient-to-r from-teal-100/80 to-cyan-100/80 rounded-xl border border-teal-200 backdrop-blur-sm animate-pulse">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-teal-700 text-sm font-medium">Analyzing audio...</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 backdrop-blur-sm">
                      <p className="text-red-600 text-sm font-medium">{error}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Recording Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-full py-3 px-6 rounded-2xl font-semibold text-white transition-all duration-300 relative overflow-hidden shadow-lg transform hover:scale-105 active:scale-95 ${
                  isRecording
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 animate-pulse shadow-red-200'
                    : isProcessing
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-teal-200'
                }`}
              >
                {/* Button shimmer effect */}
                {!isProcessing && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
                )}
                
                <span className="relative z-10">
                  {isRecording ? 'Stop Recording' : isProcessing ? 'Processing...' : 'Start Continuous Recording'}
                </span>
              </button>

              {/* Instructions - Compact */}
              <div className="mt-4 text-teal-600/70 text-sm space-y-1">
                <p className="font-medium">Continuous recording with real-time analysis</p>
                <p className="text-xs">Every 6 seconds, audio is processed for emotion detection</p>
                {isRecording && (
                  <div className="flex justify-center gap-1 mt-2">
                    <div className="w-1 h-1 bg-teal-300 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-teal-400 rounded-full animate-pulse animation-delay-100"></div>
                    <div className="w-1 h-1 bg-teal-500 rounded-full animate-pulse animation-delay-200"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%) skewX(-12deg);
            }
            100% {
              transform: translateX(200%) skewX(-12deg);
            }
          }
          .animate-shimmer {
            animation: shimmer 3s infinite;
          }
          .animation-delay-100 {
            animation-delay: 0.1s;
          }
          .animation-delay-200 {
            animation-delay: 0.2s;
          }
          .animation-delay-300 {
            animation-delay: 0.3s;
          }
        `}</style>
      </div>
    </>
  );
}
