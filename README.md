# 🎤 Cognivoice: Real-Time Voice Emotion Recognition Platform

Welcome to **Cognivoice** — an AI-powered platform for real-time voice and video emotion recognition. This project combines a robust FastAPI backend with a modern Next.js frontend, enabling users to analyze emotions from audio, live recordings, and YouTube videos, with secure authentication and persistent storage.

---

## 🚀 Features

- **Real-Time Voice Emotion Detection** (audio, live, YouTube)
- **Continuous Mood Tracking** (MoodStream)
- **User Authentication** (JWT, protected routes)
- **Audio Storage & Management**
- **Modern UI/UX** (responsive, animated, dark/light mode)
- **Batch Processing** and support for multiple audio formats

---

## 🏗️ Project Structure

```
COGNIVOICE/
├── backend/         # FastAPI backend (API, ML model, MongoDB)
└── my-app/          # Next.js frontend (React, Tailwind CSS)
```

---

## 🧩 Architecture Overview

- **Backend:** FastAPI, PyTorch (CNN model), MongoDB, JWT Auth
- **Frontend:** Next.js (App Router), React, Tailwind CSS, Context API

---

## ⚡ Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd COGNIVOICE
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies (choose one)
python install_dependencies.py           # Recommended
# or
install_dependencies.bat                 # Windows
# or
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URL and secret key

# Start MongoDB (locally or use a cloud instance)

# Launch the API server
python start_server.py
# or
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

---

### 3. Frontend Setup

```bash
cd my-app

npm install

npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

> **Note:** The frontend expects the backend API to be running at `http://localhost:8000`.

---

## 🛠️ Usage

- **Sign up or log in** to access features.
- Use **MoodStream** for continuous mood tracking.
- Try **Voice Emotion Detection** for instant analysis.
- Paste a YouTube link in **YouTube VoiceScan** to analyze video emotions.
- Toggle dark/light mode from the Navbar.

---

## 📦 API Overview (Backend)

- `POST   /api/signup` — Register a new user
- `POST   /api/login` — Login and get JWT token
- `POST   /predict-emotion` — Predict emotion from audio data
- `POST   /predict-emotion-youtube` — Predict from YouTube link (auth required)
- `GET    /my-audio` — List your uploaded audios
- ...and more (see backend/README.md for full list)

---

## 🗂️ Folder Structure

```
COGNIVOICE/
├── backend/
│   ├── app.py
│   ├── improved_inference.py
│   ├── core/
│   └── ...
└── my-app/
    ├── public/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   └── context/
    └── ...
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

- Backend: [Custom License] (see backend/README.md)
- Frontend: [MIT](my-app/LICENSE)

---

## 🙏 Credits & Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/)
- [PyTorch](https://pytorch.org/)
- [MongoDB](https://www.mongodb.com/)
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [Lucide Icons](https://lucide.dev/)
- [React Icons](https://react-icons.github.io/react-icons/)
- ...and the Cognivoice Team!

---

> _Empowering real-time emotion AI for voice applications._
