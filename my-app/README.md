# 🎤 Cognivoice: Voice Emotion Detection Frontend

Welcome to **Cognivoice** — an AI-powered voice emotion recognition platform that transforms audio and video into actionable emotional intelligence. This is the frontend (Next.js + React) for real-time voice and video emotion analysis.

---

## 🚀 Features

- **Real-Time Voice Emotion Detection**: Analyze emotions from live audio recordings.
- **MoodStream**: Continuous, real-time mood tracking from your voice.
- **YouTube VoiceScan**: Extract and analyze emotions from YouTube videos.
- **Modern UI/UX**: Beautiful, responsive design with animated feedback.
- **Authentication**: Secure login/signup and protected routes.
- **Dark/Light Mode**: Toggle between themes for your comfort.

---

## 🌐 Live Demo

> [🔗 Demo Coming Soon!](#)

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Lucide Icons](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- [Context API](https://react.dev/reference/react/createContext) for Auth

---

## 📁 Folder Structure

```
my-app/
├── public/                # Static assets (SVGs, favicon, etc.)
├── src/
│   ├── app/               # Next.js app directory (pages, layouts, routes)
│   │   ├── login/         # Login page
│   │   ├── signup/        # Signup page
│   │   ├── voice/         # Voice emotion detection page
│   │   ├── voicecontiousRecording/ # MoodStream continuous recording
│   │   ├── youtube-emotion/        # YouTube emotion analysis
│   │   ├── layout.tsx     # Root layout (Navbar, Footer, AuthProvider)
│   │   └── globals.css    # Global styles
│   ├── components/        # Reusable UI components (Navbar, Footer, etc.)
│   └── context/           # React Contexts (Auth, hooks)
├── package.json           # Project dependencies and scripts
├── README.md              # Project documentation
└── ...
```

---

## ⚡ Getting Started

### 1. **Clone the Repository**
```bash
git clone https://github.com/your-username/cognivoice-frontend.git
cd my-app
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Run the Development Server**
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

### 4. **Connect to Backend**
- This frontend expects a backend API (e.g., FastAPI) running at `http://localhost:8000`.
- Make sure to start your backend server for full functionality.

---

## 🧑‍💻 Usage

- **Sign up or log in** to access voice and video emotion features.
- Use the **MoodStream** for continuous mood tracking.
- Try **Voice Emotion Detection** for instant analysis.
- Paste a YouTube link in **YouTube VoiceScan** to analyze video emotions.
- Toggle dark/light mode from the Navbar.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📜 License

[MIT](LICENSE)

---

## 🙏 Credits

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Your Backend Team!]

---

> Made with ❤️ by the Cognivoice Team
