# app.py
from fastapi import FastAPI, HTTPException, Depends, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
import numpy as np
from typing import List, Optional
import logging
import tempfile
import soundfile as sf
import librosa
import traceback
import time
import os
import re
import html
import uuid
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import yt_dlp
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Local imports
from core.schemas.audio import AudioClipCreate, AudioClipInDB, YouTubeAudioRequest
from core.schemas.user import UserCreate, UserLogin, UserInDB
from core.security import hash_password, verify_password, create_access_token, decode_access_token
from core.db.mongo import audio_clips_collection
from core.routes.user import get_current_user, router as user_router
from improved_inference import predict_emotion_improved

limiter = Limiter(key_func=get_remote_address)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Voice Emotion Detection API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware to allow requests from your Next.js frontend
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    frontend_url
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)

class AudioRequest(BaseModel):
    audio_data: List[float]

class EmotionResponse(BaseModel):
    emotion: str
    confidence: Optional[float] = None
    processing_time: Optional[float] = None

class AudioSaveRequest(BaseModel):
    audio_data: List[float]
    emotion: Optional[str] = None
    timestamp: Optional[float] = None
    notes: Optional[str] = None

# JWT config - using core.security functions instead

@app.get("/")
async def root():
    return {"message": "Voice Emotion Detection API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": True}

@app.post("/predict-emotion", response_model=EmotionResponse)
async def predict_emotion(request: AudioRequest):
    try:
        # Validate input
        if not request.audio_data:
            raise HTTPException(status_code=400, detail="Audio data is required")
        
        if len(request.audio_data) == 0:
            raise HTTPException(status_code=400, detail="Audio data cannot be empty")
        
        logger.info(f"Received audio data with {len(request.audio_data)} samples")
        
        # Convert to numpy array
        audio_array = np.array(request.audio_data, dtype=np.float32)
        
        # Validate audio array
        if np.isnan(audio_array).any():
            logger.warning("Audio data contains NaN values, replacing with zeros")
            audio_array = np.nan_to_num(audio_array)
        
        if np.isinf(audio_array).any():
            logger.warning("Audio data contains infinite values, clipping")
            audio_array = np.clip(audio_array, -1.0, 1.0)
        
        # Check if audio is too quiet (all zeros or very small values)
        if np.max(np.abs(audio_array)) < 1e-6:
            logger.warning("Audio appears to be silent")
            return EmotionResponse(
                emotion="neutral",
                processing_time=0.0
            )
        
        # Normalize audio to prevent clipping
        max_val = np.max(np.abs(audio_array))
        if max_val > 1.0:
            audio_array = audio_array / max_val
            logger.info(f"Audio normalized from max value: {max_val}")
        
        # Use your existing prediction function
        start_time = time.time()
        
        try:
            predicted_emotion = predict_emotion_improved(audio_array)
        except Exception as e:
            logger.error(f"Error in prediction model: {str(e)}")
            logger.error(traceback.format_exc())
            # Return a default emotion if model fails
            predicted_emotion = "neutral"
        
        processing_time = time.time() - start_time
        
        logger.info(f"Predicted emotion: {predicted_emotion} (processing time: {processing_time:.3f}s)")
        
        return EmotionResponse(
            emotion=predicted_emotion,
            processing_time=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing audio: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

@app.post("/predict-emotion-batch")
async def predict_emotion_batch(requests: List[AudioRequest]):
    """Batch prediction endpoint for multiple audio samples"""
    try:
        results = []
        for i, request in enumerate(requests):
            try:
                # Validate and process audio
                audio_array = np.array(request.audio_data, dtype=np.float32)
                
                # Basic validation
                if len(audio_array) == 0:
                    results.append({
                        "index": i,
                        "emotion": "neutral",
                        "success": True,
                        "warning": "Empty audio data"
                    })
                    continue
                
                # Clean audio data
                audio_array = np.nan_to_num(audio_array)
                audio_array = np.clip(audio_array, -1.0, 1.0)
                
                # Normalize if needed
                max_val = np.max(np.abs(audio_array))
                if max_val > 1.0:
                    audio_array = audio_array / max_val
                
                predicted_emotion = predict_emotion_improved(audio_array)
                results.append({
                    "index": i,
                    "emotion": predicted_emotion,
                    "success": True
                })
            except Exception as e:
                logger.error(f"Error processing audio sample {i}: {str(e)}")
                results.append({
                    "index": i,
                    "emotion": "neutral",
                    "success": False,
                    "error": str(e)
                })
        
        return {"results": results}
        
    except Exception as e:
        logger.error(f"Error in batch prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in batch prediction: {str(e)}")

@app.post("/predict-emotion-file", response_model=EmotionResponse)
async def predict_emotion_file(file: UploadFile = File(...)):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an audio file.")
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Save uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            contents = await file.read()
            if len(contents) == 0:
                raise HTTPException(status_code=400, detail="Empty file")
            
            tmp.write(contents)
            tmp_path = tmp.name

        # Try to load audio using librosa (handles most formats)
        try:
            audio, sr = librosa.load(tmp_path, sr=22050, mono=True)
        except Exception as e:
            logger.error(f"Error loading audio with librosa: {str(e)}")
            try:
                # Try with soundfile as fallback
                audio, sr = sf.read(tmp_path)
                if sr != 22050:
                    audio = librosa.resample(audio, orig_sr=sr, target_sr=22050)
                    sr = 22050
                if audio.ndim > 1:
                    audio = audio[:, 0]  # Take first channel if stereo
            except Exception as e2:
                logger.error(f"Error loading audio with soundfile: {str(e2)}")
                raise HTTPException(status_code=400, detail="Unable to decode audio file")

        # Validate loaded audio
        if len(audio) == 0:
            raise HTTPException(status_code=400, detail="Audio file appears to be empty")
        
        # Clean and normalize audio
        audio = np.nan_to_num(audio)
        audio = np.clip(audio, -1.0, 1.0)
        
        max_val = np.max(np.abs(audio))
        if max_val > 1.0:
            audio = audio / max_val

        # Use your existing prediction function
        start_time = time.time()
        try:
            predicted_emotion = predict_emotion_improved(audio)
        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            predicted_emotion = "neutral"
        
        processing_time = time.time() - start_time

        return EmotionResponse(
            emotion=predicted_emotion,
            processing_time=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing uploaded audio: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing uploaded audio: {str(e)}")

@app.get("/emotions")
async def get_supported_emotions():
    """Get list of supported emotions"""
    try:
        from improved_inference import EMOTIONS
        return {"emotions": EMOTIONS}
    except Exception as e:
        logger.error(f"Error getting emotions: {str(e)}")
        return {"emotions": ["neutral", "happy", "sad", "angry", "fearful", "surprised", "disgust", "calm"]}

@app.get("/test")
async def test_prediction():
    """Test endpoint with dummy audio data"""
    try:
        # Generate dummy audio data (silence)
        dummy_audio = np.zeros(22050 * 3, dtype=np.float32)  # 3 seconds of silence
        predicted_emotion = predict_emotion_improved(dummy_audio)
        return {"test_emotion": predicted_emotion, "status": "success"}
    except Exception as e:
        logger.error(f"Test prediction failed: {str(e)}")
        return {"error": str(e), "status": "failed"}

YOUTUBE_URL_REGEX = r"(https?://)?(www\.)?(youtube\.com|youtu\.be)/.+"

@app.post("/predict-emotion-youtube", response_model=EmotionResponse)
@limiter.limit("8/minute")
async def predict_emotion_youtube(
    request: Request,
    body: YouTubeAudioRequest,
    current_user: dict = Depends(get_current_user)
):
    if not re.match(YOUTUBE_URL_REGEX, body.youtube_url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    
    tmp_path = None
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix=".%(ext)s", delete=False) as tmp:
            tmp_path = tmp.name.replace(".%(ext)s", ".wav")
            
            # yt-dlp options for audio extraction
            ydl_opts = {
                'format': 'bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio/best',
                'outtmpl': tmp.name.replace(".%(ext)s", ".%(ext)s"),
                'quiet': True,
                'no_warnings': True,
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'wav',
                    'preferredquality': '22050',
                }],
                'extractaudio': True,
                'audioformat': 'wav',
                'audioquality': 0,
                'prefer_ffmpeg': True,
            }
            
            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    # Get info first to validate URL
                    info = ydl.extract_info(body.youtube_url, download=False)
                    if not info:
                        raise HTTPException(status_code=400, detail="Could not extract video information")
                    
                    # Check video duration (optional: limit to reasonable length)
                    duration = info.get('duration', 0)
                    if duration > 600:  # 10 minutes limit
                        raise HTTPException(status_code=400, detail="Video too long (max 10 minutes)")
                    
                    # Download and extract
                    ydl.download([body.youtube_url])
                    
            except yt_dlp.utils.DownloadError as e:
                logger.error(f"yt-dlp download error: {str(e)}")
                raise HTTPException(status_code=400, detail="Failed to download YouTube video")
        
        # Try multiple approaches to load the audio
        audio = None
        sr = None
        
        # Method 1: Try to load the processed wav file
        if os.path.exists(tmp_path):
            try:
                audio, sr = librosa.load(tmp_path, sr=22050, mono=True)
                logger.info("Successfully loaded audio with librosa")
            except Exception as e:
                logger.warning(f"Librosa failed: {str(e)}")
        
        # Method 2: Look for other generated files
        if audio is None:
            base_path = tmp_path.replace(".wav", "")
            for ext in [".webm", ".m4a", ".mp3", ".opus"]:
                test_path = base_path + ext
                if os.path.exists(test_path):
                    try:
                        audio, sr = librosa.load(test_path, sr=22050, mono=True)
                        logger.info(f"Successfully loaded audio from {ext} file")
                        tmp_path = test_path  # Update for cleanup
                        break
                    except Exception as e:
                        logger.warning(f"Failed to load {ext} file: {str(e)}")
                        continue
        
        # Method 3: Direct download without postprocessing
        if audio is None:
            logger.info("Trying direct download without postprocessing")
            with tempfile.NamedTemporaryFile(suffix=".%(ext)s", delete=False) as tmp2:
                tmp2_path = tmp2.name
                
                ydl_opts_simple = {
                    'format': 'bestaudio/best',
                    'outtmpl': tmp2_path,
                    'quiet': True,
                    'no_warnings': True,
                }
                
                try:
                    with yt_dlp.YoutubeDL(ydl_opts_simple) as ydl:
                        ydl.download([body.youtube_url])
                    
                    # Find the downloaded file
                    for ext in [".webm", ".m4a", ".mp4", ".opus"]:
                        test_path = tmp2_path.replace(".%(ext)s", ext)
                        if os.path.exists(test_path):
                            audio, sr = librosa.load(test_path, sr=22050, mono=True)
                            logger.info(f"Successfully loaded audio from direct download: {ext}")
                            # Clean up this temp file too
                            try:
                                os.remove(test_path)
                            except OSError as cleanup_err:
                                logger.warning(f"Failed to cleanup temp file {test_path}: {cleanup_err}")
                            break
                            
                except Exception as e:
                    logger.error(f"Direct download failed: {str(e)}")
        
        if audio is None or len(audio) == 0:
            raise HTTPException(status_code=500, detail="Could not extract audio from video")
        
        # Process audio
        audio = np.nan_to_num(audio)
        audio = np.clip(audio, -1.0, 1.0)
        
        # Normalize if needed
        max_val = np.max(np.abs(audio))
        if max_val > 1.0:
            audio = audio / max_val
        elif max_val < 1e-6:
            raise HTTPException(status_code=400, detail="Audio appears to be silent")
        
        # Predict emotion
        start_time = time.time()
        try:
            predicted_emotion = predict_emotion_improved(audio)
        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            predicted_emotion = "neutral"
        
        processing_time = time.time() - start_time
        
        # Save to DB
        audio_doc = {
            "user_id": str(current_user.get("_id")),
            "email": current_user["email"],
            "emotion": predicted_emotion,
            "timestamp": time.time(),
            "notes": html.escape(body.notes) if body.notes else None,
            "created_at": datetime.now(timezone.utc),
            "youtube_url": body.youtube_url
        }
        result = await audio_clips_collection.insert_one(audio_doc)
        
        return EmotionResponse(
            emotion=predicted_emotion,
            processing_time=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing YouTube audio: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing YouTube audio: {str(e)}")
    
    finally:
        # Clean up temporary files
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception as cleanup_err:
                logger.warning(f"Failed to delete temp file: {tmp_path} ({cleanup_err})")
        
        # Also clean up any other potential temp files
        try:
            base_path = tmp_path.replace(".wav", "") if tmp_path else None
            if base_path:
                for ext in [".webm", ".m4a", ".mp3", ".opus", ".mp4"]:
                    test_path = base_path + ext
                    if os.path.exists(test_path):
                        os.remove(test_path)
        except Exception:
            pass

@app.post("/save-audio")
async def save_audio(request: AudioClipCreate, current_user: dict = Depends(get_current_user)):
    if not request.audio_data or len(request.audio_data) == 0:
        raise HTTPException(status_code=400, detail="Audio data required")
    
    # Save audio as .npy file
    
    
    # Predict emotion if not provided
    emotion = request.emotion
    if not emotion:
        audio_array = np.array(request.audio_data, dtype=np.float32)
        try:
            emotion = predict_emotion_improved(audio_array)
        except Exception:
            emotion = "neutral"
    
    audio_doc = {
        "user_id": str(current_user.get("_id")),
        "email": current_user["email"],
        "audio_data": request.audio_data,  # Store path instead of raw data
        "emotion": emotion,
        "timestamp": request.timestamp or time.time(),
        "notes": html.escape(request.notes) if request.notes else None,
        "created_at": datetime.now(timezone.utc)
    }
    result = await audio_clips_collection.insert_one(audio_doc)
    return {"msg": "Audio saved", "audio_id": str(result.inserted_id), "emotion": emotion}

@app.get("/my-audio", response_model=List[AudioClipInDB])
async def get_my_audio(skip: int = 0,
    limit: int = 20,current_user: dict = Depends(get_current_user)):
    cursor = audio_clips_collection.find({"user_id": str(current_user.get("_id"))}).skip(skip).limit(limit)
    audio_list = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])  # Convert ObjectId to string
        audio_list.append(AudioClipInDB(**doc))
    return audio_list

@app.get("/my-youtube-audio", response_model=List[AudioClipInDB])
async def get_my_youtube_audio(
    skip: int = 0,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    cursor = audio_clips_collection.find({
        "user_id": str(current_user.get("_id")),
        "youtube_url": {"$exists": True, "$ne": None}
    }).skip(skip).limit(limit)
    audio_list = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])  # Convert ObjectId to string
        audio_list.append(AudioClipInDB(**doc))
    return audio_list

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")