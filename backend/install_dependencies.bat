@echo off
echo Installing Voice Emotion Detection API dependencies...
echo.

REM Install all required packages
pip install fastapi
pip install uvicorn
pip install motor
pip install "passlib[bcrypt]"
pip install python-jose
pip install "pydantic[email]"
pip install numpy
pip install librosa
pip install soundfile
pip install torch
pip install email-validator

echo.
echo Installation complete!
echo You can now run: python start_server.py
pause 