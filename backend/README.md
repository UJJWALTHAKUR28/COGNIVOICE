---
title: Cognivoice Backend
emoji: 🎤
colorFrom: blue
colorTo: purple
sdk: docker

app_file: app.py
app_port: 7860
pinned: false
---

# Voice Emotion Detection API Backend

[![Python](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Required-brightgreen)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-Custom-lightgrey)](#license)

---

## 🎤 Real-Time Voice Emotion Recognition API

A robust FastAPI backend for real-time voice emotion recognition using deep learning. Supports user authentication, audio uploads, YouTube audio analysis, and persistent storage with MongoDB.

---

## 🚀 Features

- **Real-time emotion detection** from audio and YouTube links
- **User authentication** with JWT tokens
- **Audio storage** with user association
- **Batch processing** for multiple audio samples
- **Multiple audio formats** supported
- **Deep learning model** (CNN-based)
- **Modern, async Python stack**

---

## 🏁 Quickstart

```bash
# 1. Clone the repository
$ git clone <repository-url>
$ cd backend

# 2. Install dependencies (choose one)
$ python install_dependencies.py           # Recommended
$ install_dependencies.bat                 # Windows
$ pip install -r requirements.txt          # Manual

# 3. Configure environment
$ cp .env.example .env                     # Or create .env manually
# Edit .env with your MongoDB URL and secret key

# 4. Start MongoDB (locally or use a cloud instance)

# 5. Launch the API server
$ python start_server.py                   # Or:
$ uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📚 API Overview

### Authentication
- `POST   /api/signup`         — Register a new user
- `POST   /api/login`          — Login and get JWT token
- `GET    /api/me`             — Get current user info

### Emotion Detection
- `POST   /predict-emotion`        — Predict emotion from audio data
- `POST   /predict-emotion-batch`  — Batch prediction
- `POST   /predict-emotion-file`   — Predict from uploaded file
- `POST   /predict-emotion-youtube`— Predict from YouTube link (requires auth)
- `GET    /emotions`               — List supported emotions

### Audio Management
- `POST   /save-audio`         — Save audio with emotion (requires auth)
- `GET    /my-audio`           — List your uploaded audios
- `GET    /my-youtube-audio`   — List your YouTube audios

### Health & Testing
- `GET    /`                   — API status
- `GET    /health`             — Health check
- `GET    /test`               — Dummy prediction

---

## 🧑‍💻 Usage Examples

<details>
<summary><strong>Register a User</strong></summary>

```bash
curl -X POST "http://localhost:8000/api/signup" \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password123", "name": "John Doe"}'
```
</details>

<details>
<summary><strong>Login</strong></summary>

```bash
curl -X POST "http://localhost:8000/api/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password123"}'
```
</details>

<details>
<summary><strong>Predict Emotion from Audio Data</strong></summary>

```bash
curl -X POST "http://localhost:8000/predict-emotion" \
     -H "Content-Type: application/json" \
     -d '{"audio_data": [0.1, 0.2, 0.3, ...]}'
```
</details>

<details>
<summary><strong>Predict Emotion from YouTube Link (Authenticated)</strong></summary>

```bash
curl -X POST "http://localhost:8000/predict-emotion-youtube" \
     -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"youtube_url": "https://www.youtube.com/watch?v=..."}'
```
</details>

---

## 🗂️ Project Structure

```text
backend/
├── app.py                          # Main FastAPI application
├── improved_inference.py           # Emotion detection model
├── improved_emotion_recognition_model.pth  # Trained model weights
├── requirements.txt                # Python dependencies
├── start_server.py                 # Startup script
├── test_imports.py                 # Import testing script
├── README.md                       # This file
└── core/
    ├── config.py                   # Configuration settings
    ├── security.py                 # Authentication utilities
    ├── db/
    │   └── mongo.py                # Database connections
    ├── models/
    │   └── user.py                 # User model
    ├── schemas/
    │   ├── user.py                 # User schemas
    │   └── audio.py                # Audio schemas
    ├── services/
    │   └── user_service.py         # User business logic
    └── routes/
        └── user.py                 # User API routes
```

---

## 🛠️ Troubleshooting & FAQ

<details>
<summary><strong>ModuleNotFoundError: No module named 'models'</strong></summary>
Update your import paths to use `core.schemas.user` instead of `models.user`.
</details>

<details>
<summary><strong>PyTorch FutureWarning about weights_only</strong></summary>
Add `weights_only=True` to `torch.load()` in your model loading code.
</details>

<details>
<summary><strong>MongoDB connection issues</strong></summary>
- Ensure MongoDB is running
- Check your `MONGO_URL` in the `.env` file
</details>

<details>
<summary><strong>Missing dependencies</strong></summary>
Run `pip install -r requirements.txt` or use the provided install scripts.
</details>

<details>
<summary><strong>How do I test my installation?</strong></summary>
Run:

```bash
python test_imports.py
```
</details>

---

## 🤝 Contributing

Contributions are welcome! To add features or fix bugs:
1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

[Add your license information here]

---

## 🙋 Support & Contact

- For questions, open an issue on GitHub
- For feature requests, use the Discussions or Issues tab
- For commercial or research inquiries, contact the maintainer

---

## 🌟 Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/)
- [PyTorch](https://pytorch.org/)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [MongoDB](https://www.mongodb.com/)

---

> _Empowering real-time emotion AI for voice applications._ 