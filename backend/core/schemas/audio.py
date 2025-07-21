from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class AudioClipCreate(BaseModel):
    audio_data: List[float] = Field(..., description="Raw audio data as a list of floats")
    emotion: Optional[str] = Field(None, description="Predicted or user-provided emotion label")
    timestamp: Optional[float] = Field(None, description="Unix timestamp when the audio was recorded")
    notes: Optional[str] = Field(None, description="Any additional notes about the audio")

class AudioClipInDB(AudioClipCreate):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str = Field(..., description="ID of the user who uploaded the audio")
    email: EmailStr = Field(..., description="Email of the user")
    created_at: datetime = Field(..., description="UTC datetime when the audio was saved")
    youtube_url: Optional[str] = Field(None, description="YouTube URL if audio is from YouTube")

class YouTubeAudioRequest(BaseModel):
    youtube_url: str
    notes: Optional[str] = None
