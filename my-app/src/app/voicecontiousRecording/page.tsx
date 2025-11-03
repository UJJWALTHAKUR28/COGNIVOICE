"use client";
import { useState, useRef, useEffect } from "react";
import useRequireAuth from "@/context/useRequireAuth";

export default function VoiceEmotionDetection() {
  // --- Always call hooks before any early return ---
  const user = useRequireAuth();

  const [isRecording, setIsRecording] = useState(false);
  const [emotion, setEmotion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shouldContinueRecordingRef = useRef(false);

  const API_URL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // --- Cleanup ---
  const cleanupResources = (): void => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (processingIntervalRef.current) clearInterval(processingIntervalRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    audioChunksRef.current = [];
    streamRef.current = null;
    mediaRecorderRef.current = null;
    analyserRef.current = null;
    animationFrameRef.current = null;
    processingIntervalRef.current = null;
  };

  // --- Audio processing ---
  const processAudioForBackend = async (audioBlob: Blob): Promise<number[] | null> => {
    try {
      const buffer = await audioBlob.arrayBuffer();
      const ctx = new AudioContext({ sampleRate: 22050 });
      const decoded = await ctx.decodeAudioData(buffer);
      const data = decoded.getChannelData(0);
      const len = 22050 * 6; // 6 seconds
      const arr = Array.from(data.slice(0, len));
      if (arr.length < len) arr.push(...Array(len - arr.length).fill(0));
      await ctx.close();
      return arr;
    } catch {
      setError("Audio decoding failed");
      return null;
    }
  };

  const sendAudioToBackend = async (audioArray: number[]): Promise<string> => {
    const res = await fetch(`${API_URL}/predict-emotion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio_data: audioArray }),
    });
    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
    const result = await res.json();
    return result.emotion || result.prediction || "unknown";
  };

  const processAndPredict = async (): Promise<void> => {
    if (audioChunksRef.current.length === 0) return;
    setIsProcessing(true);
    const combinedBlob = new Blob(audioChunksRef.current, { type: "audio/webm;codecs=opus" });
    audioChunksRef.current = [];
    try {
      const audioArray = await processAudioForBackend(combinedBlob);
      if (audioArray) {
        const predictedEmotion = await sendAudioToBackend(audioArray);
        setEmotion(predictedEmotion);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error during processing";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Visualizer ---
  const updateAudioVisualizer = (): void => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    setAudioLevel(avg);
    if (shouldContinueRecordingRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateAudioVisualizer);
    }
  };

  // --- Start / Stop Recording ---
  const startRecording = async (): Promise<void> => {
    shouldContinueRecordingRef.current = true;
    setIsRecording(true);
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 22050,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const ctx = new AudioContext({ sampleRate: 22050 });
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      updateAudioVisualizer();

      const mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        throw new Error("WebM Opus not supported");
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        await processAndPredict();
        if (shouldContinueRecordingRef.current && !isProcessing) recorder.start();
      };

      recorder.start();
      processingIntervalRef.current = setInterval(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 6000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start recording";
      setError(message);
      stopRecording();
    }
  };

  const stopRecording = (): void => {
    shouldContinueRecordingRef.current = false;
    setIsRecording(false);
    setAudioLevel(0);
    cleanupResources();
  };

  // --- Color ---
  const getEmotionColor = (e: string): string => {
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
    return colors[e?.toLowerCase()] || "#808080";
  };

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => cleanupResources();
  }, []);

  // --- Render after hooks ---
  if (!user) return null;

  // --- UI ---
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="text-center pt-10">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          MoodStream
        </h1>
        <p className="text-teal-700 font-medium mt-2">
          Real-Time Voice Emotion Detection
        </p>
      </div>

      <div className="flex justify-center mt-10">
        <div className="p-6 rounded-3xl shadow-xl border border-teal-100 bg-white/80 backdrop-blur-xl w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div
              className={`${
                isRecording ? "w-32 h-32" : "w-24 h-24"
              } rounded-full border-4 border-teal-300 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50 shadow-lg`}
            >
              <div
                className="absolute inset-0 bg-gradient-to-t from-teal-400 to-cyan-400 transition-all duration-100"
                style={{
                  transform: `translateY(${100 - (audioLevel / 255) * 100}%)`,
                  opacity: isRecording ? 0.8 : 0.2,
                }}
              />
              <div className="relative z-10">
                {isRecording ? (
                  <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse shadow-lg" />
                ) : isProcessing ? (
                  <div className="w-6 h-6 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full" />
                )}
              </div>
            </div>
          </div>

          {emotion && (
            <div className="text-center mb-4">
              <p className="text-sm text-teal-700">Current Emotion</p>
              <p
                className="text-2xl font-bold capitalize"
                style={{ color: getEmotionColor(emotion) }}
              >
                {emotion}
              </p>
            </div>
          )}

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          {isProcessing && (
            <p className="text-teal-600 text-sm mb-2 animate-pulse">
              Analyzing audio...
            </p>
          )}

          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`w-full py-3 px-6 rounded-2xl font-semibold text-white transition-all duration-300 ${
              isRecording
                ? "bg-gradient-to-r from-red-500 to-pink-500 animate-pulse"
                : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            }`}
          >
            {isRecording
              ? "Stop Recording"
              : isProcessing
              ? "Processing..."
              : "Start Continuous Recording"}
          </button>
        </div>
      </div>
    </div>
  );
}
