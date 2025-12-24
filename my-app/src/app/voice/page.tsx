"use client";
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import useRequireAuth from "@/context/useRequireAuth";
import { API_URL } from '@/config/api';
export default function VoiceEmotionDetection() {
  const user = useRequireAuth();
  if (!user) return null;
  const [isRecording, setIsRecording] = useState(false);
  const [emotion, setEmotion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const router = useRouter();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);



  // Clean up resources safely
  const cleanupResources = () => {
    // Cancel animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Close audio context safely
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Clear analyser reference
    analyserRef.current = null;
  };

  // Initialize audio context and analyzer for visual feedback
  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 22050, // Match your model's sample rate
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || window.AudioContext)();
      if (audioContextRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        if (analyserRef.current) {
          source.connect(analyserRef.current);
          analyserRef.current.fftSize = 256;
        }
      }

      return stream;
    } catch (err) {
      throw new Error('Microphone access denied or not available');
    }
  };

  // Visual feedback for recording
  const updateAudioLevel = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average);
    }

    if (isRecording) {
      animationRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  // Convert audio blob to the format expected by your backend
  const processAudioForBackend = async (audioBlob: Blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          if (!e.target) {
            resolve(null);
            return;
          }
          const arrayBuffer = (e.target as FileReader).result;
          const audioContext = new (window.AudioContext || window.AudioContext)({
            sampleRate: 22050 // Match your model's sample rate
          });

          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer as ArrayBuffer);
          const audioData = audioBuffer.getChannelData(0); // Get mono channel

          // Convert to the format your backend expects
          const audioArray = Array.from(audioData);
          
          // Close this temporary audio context
          if (audioContext.state !== 'closed') {
            audioContext.close();
          }
          
          resolve(audioArray);
        } catch (error) {
          console.error('Error processing audio:', error);
          resolve(null);
        }
      };
      reader.readAsArrayBuffer(audioBlob);
    });
  };

  // Send audio to backend for emotion prediction
  const sendAudioToBackend = async (audioArray: number[]) => {
    try {
      const response = await fetch(`${API_URL}/predict-emotion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_data: audioArray
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.emotion || result.prediction; // Adjust based on your API response format
    } catch (error) {
      console.error('Backend request failed:', error);
      throw error;
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      setError('');
      setIsProcessing(false);

      const stream = await initializeAudio();

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setIsProcessing(true);

        try {
          const audioArray = await processAudioForBackend(audioBlob);
          if (audioArray) {
            const predictedEmotion = await sendAudioToBackend(audioArray as number[]);
            setEmotion(predictedEmotion);
          } else {
            setError('Failed to process audio');
          }
        } catch (error) {
          setError('Failed to get emotion prediction: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      updateAudioLevel();

      // Auto-stop after 3 seconds to match your model's duration
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 3000);

    } catch (error) {
      setError('Failed to start recording: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clean up resources after stopping
      cleanupResources();
    }
  };

  // Get emotion color for visual feedback
  const getEmotionColor = (emotion: string) => {
    type EmotionKey = 'happy' | 'sad' | 'angry' | 'fearful' | 'surprised' | 'disgust' | 'calm' | 'neutral';
    const colors: Record<EmotionKey, string> = {
      'happy': '#FFD700',
      'sad': '#4169E1',
      'angry': '#FF4500',
      'fearful': '#800080',
      'surprised': '#FF69B4',
      'disgust': '#228B22',
      'calm': '#20B2AA',
      'neutral': '#808080'
    };
    const key = emotion?.toLowerCase() as EmotionKey;
    return colors[key] || '#808080';
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  return (
    <>
      <Head>
        <title>Voice Emotion Detection</title>
        <meta name="description" content="Real-time voice emotion detection" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-teal-100 to-teal-200 rounded-full mix-blend-multiply animate-pulse opacity-70"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-cyan-100 to-cyan-200 rounded-full mix-blend-multiply animate-bounce opacity-70"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-r from-teal-200 to-teal-300 rounded-full mix-blend-multiply animate-ping opacity-70"></div>
        <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-gradient-to-r from-cyan-200 to-cyan-300 rounded-full mix-blend-multiply animate-pulse opacity-70"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center h-[660px] p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl h-[650px] p-8 max-w-md w-full shadow-2xl border border-teal-100 relative overflow-hidden">
          {/* Card Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-shimmer"></div>
          
          <div className="text-center relative z-10">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent mb-2 tracking-tight">
                Voice Emotion
              </h1>
              <h2 className="text-xl text-teal-600/80 font-medium tracking-wide">Detection</h2>
            </div>

            {/* Enhanced Audio Level Visualizer */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 w-40 h-40 border-2 border-teal-200 rounded-full animate-spin"></div>
                
                {/* Main visualizer container */}
                <div className="w-40 h-40 rounded-full border-4 border-teal-300/50 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50 shadow-lg">
                  
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
                        <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                        <div className="absolute inset-0 w-8 h-8 bg-red-400 rounded-full animate-ping"></div>
                      </div>
                    ) : isProcessing ? (
                      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full shadow-lg flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
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

            {/* Enhanced Current Emotion Display */}
            {emotion && (
              <div className="mb-6 p-6 bg-gradient-to-br from-teal-50/80 to-cyan-50/80 rounded-2xl border border-teal-100 backdrop-blur-sm shadow-lg transform transition-all duration-500 hover:scale-105">
                <p className="text-teal-600/80 text-sm mb-2 font-medium tracking-wide">Detected Emotion:</p>
                <p 
                  className="text-3xl font-bold capitalize tracking-wide drop-shadow-sm"
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
            )}

            {/* Enhanced Status Messages */}
            {isProcessing && (
              <div className="mb-4 p-4 bg-gradient-to-r from-teal-100/80 to-cyan-100/80 rounded-xl border border-teal-200 backdrop-blur-sm animate-pulse">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-teal-700 text-sm font-medium">Processing audio...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 backdrop-blur-sm">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Enhanced Recording Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 relative overflow-hidden shadow-lg transform hover:scale-105 active:scale-95 ${
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
                {isRecording ? 'Stop Recording' : isProcessing ? 'Processing...' : ' Start Recording'}
              </span>
            </button>

            {/* Enhanced Instructions */}
            <div className="mt-6 text-teal-600/70 text-sm space-y-1">
              <p className="font-medium">Click to record 3 seconds of audio</p>
              <p>for emotion detection</p>
              <div className="flex justify-center gap-2 mt-3">
                <div className="w-2 h-2 bg-teal-300 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse animation-delay-100"></div>
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse animation-delay-200"></div>
              </div>
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