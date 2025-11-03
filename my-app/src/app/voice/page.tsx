"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Head from "next/head";
import useRequireAuth from "@/context/useRequireAuth";

export default function VoiceEmotionDetection() {
  const user = useRequireAuth();

  // ---------- STATE HOOKS ----------
  const [isRecording, setIsRecording] = useState(false);
  const [emotion, setEmotion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Removed unused audioLevel to fix ESLint error

  // ---------- REF HOOKS ----------
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // ---------- CLEANUP ----------
  const cleanupResources = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
  }, []);

  useEffect(() => {
    return () => cleanupResources();
  }, [cleanupResources]);

  // ---------- INITIALIZE AUDIO ----------
  const initializeAudio = useCallback(async (): Promise<MediaStream> => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 22050,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;

    streamRef.current = stream;
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    return stream;
  }, []);

  // ---------- AUDIO PROCESSING ----------
  const processAudioForBackend = async (audioBlob: Blob): Promise<number[] | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const tempContext = new AudioContext({ sampleRate: 22050 });
          const audioBuffer = await tempContext.decodeAudioData(buffer);
          const audioData = audioBuffer.getChannelData(0);
          const arr = Array.from(audioData);
          await tempContext.close();
          resolve(arr);
        } catch {
          resolve(null);
        }
      };
      reader.readAsArrayBuffer(audioBlob);
    });
  };

  const sendAudioToBackend = useCallback(async (audioArray: number[]): Promise<string> => {
    const res = await fetch(`${API_URL}/predict-emotion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio_data: audioArray }),
    });

    if (!res.ok) throw new Error(`Backend error ${res.status}`);

    const result: { emotion?: string; prediction?: string } = await res.json();
    return result.emotion || result.prediction || "unknown";
  }, [API_URL]);

  // ---------- RECORDING ----------
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      cleanupResources();
    }
  }, [cleanupResources]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setIsProcessing(false);

      const stream = await initializeAudio();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => audioChunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        setIsProcessing(true);

        try {
          const audioArray = await processAudioForBackend(audioBlob);
          if (audioArray) {
            const predictedEmotion = await sendAudioToBackend(audioArray);
            setEmotion(predictedEmotion);
          } else {
            setError("Audio processing failed");
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Prediction failed";
          setError(message);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto stop after 3 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") stopRecording();
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start recording";
      setError(message);
    }
  }, [initializeAudio, stopRecording, sendAudioToBackend]);

  // ---------- EMOTION COLORS ----------
  const getEmotionColor = (emotionName: string): string => {
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
    return colors[emotionName?.toLowerCase()] || "#808080";
  };

  // ---------- RENDER ----------
  if (!user) return null;

  return (
    <>
      <Head>
        <title>Voice Emotion Detection</title>
        <meta name="description" content="Real-time voice emotion detection" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-teal-100 rounded-full mix-blend-multiply animate-pulse opacity-70"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-cyan-100 rounded-full mix-blend-multiply animate-ping opacity-70"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center h-[660px] p-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl h-[650px] p-8 max-w-md w-full shadow-2xl border border-teal-100 relative overflow-hidden">
            <div className="text-center relative z-10">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent mb-2">
                Voice Emotion
              </h1>
              <h2 className="text-xl text-teal-600/80 mb-8">Detection</h2>

              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full border-4 border-teal-300/50 flex items-center justify-center">
                    {isRecording ? (
                      <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
                    ) : isProcessing ? (
                      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <div className="w-8 h-8 bg-teal-400 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>

              {emotion && (
                <div
                  className="p-4 rounded-xl border mt-4"
                  style={{ borderColor: getEmotionColor(emotion) }}
                >
                  <p className="text-teal-700">Detected Emotion:</p>
                  <p
                    className="text-3xl font-bold capitalize"
                    style={{ color: getEmotionColor(emotion) }}
                  >
                    {emotion}
                  </p>
                </div>
              )}

              {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-full py-4 mt-6 rounded-xl text-white font-semibold ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : isProcessing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-500 hover:bg-teal-600"
                }`}
              >
                {isRecording
                  ? "Stop Recording"
                  : isProcessing
                  ? "Processing..."
                  : "Start Recording"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
