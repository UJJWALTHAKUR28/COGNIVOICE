import torch
import torch.nn as nn
import numpy as np
import librosa
import os
from sklearn.preprocessing import LabelEncoder

# === Model architecture ===
class SEBlock(nn.Module):
    def __init__(self, channels, reduction=16):
        super(SEBlock, self).__init__()
        self.avg_pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Sequential(
            nn.Linear(channels, channels // reduction, bias=False),
            nn.ReLU(inplace=True),
            nn.Linear(channels // reduction, channels, bias=False),
            nn.Sigmoid()
        )

    def forward(self, x):
        b, c, _, _ = x.size()
        y = self.avg_pool(x).view(b, c)
        y = self.fc(y).view(b, c, 1, 1)
        return x * y.expand_as(x)


class EmotionCNN(nn.Module):
    def __init__(self, num_classes=8, use_se=True):
        super(EmotionCNN, self).__init__()
        self.use_se = use_se
        self.conv1 = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )
        if use_se:
            self.se1 = SEBlock(32)
        self.conv2 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )
        if use_se:
            self.se2 = SEBlock(64)
        self.conv3 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )
        if use_se:
            self.se3 = SEBlock(128)
        self.conv4 = nn.Sequential(
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )
        if use_se:
            self.se4 = SEBlock(256)
        self.global_pool = nn.AdaptiveAvgPool2d(1)
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        x = self.conv1(x)
        if self.use_se:
            x = self.se1(x)
        x = self.conv2(x)
        if self.use_se:
            x = self.se2(x)
        x = self.conv3(x)
        if self.use_se:
            x = self.se3(x)
        x = self.conv4(x)
        if self.use_se:
            x = self.se4(x)
        x = self.global_pool(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)


# === Constants ===
SAMPLE_RATE = 22050
DURATION = 3  # seconds
N_MELS = 128
TARGET_LENGTH = SAMPLE_RATE * DURATION


# === Model + Label Encoder Loading ===
try:
    model_path = os.path.join(os.path.dirname(__file__), "improved_emotion_recognition_model.pth")

    # Allow safe deserialization of sklearn LabelEncoder (PyTorch ≥ 2.6)
    try:
        torch.serialization.add_safe_globals([LabelEncoder])
        checkpoint = torch.load(model_path, map_location=torch.device("cpu"))
    except Exception as e:
        print(f"[Warning] Safe load failed ({e}), retrying with weights_only=False...")
        checkpoint = torch.load(model_path, map_location=torch.device("cpu"), weights_only=False)

    # Initialize model and load weights
    model = EmotionCNN(num_classes=8, use_se=True)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()

    # Load label encoder or fallback emotion list
    label_encoder = checkpoint.get("label_encoder", None)
    EMOTIONS = (
        label_encoder.classes_.tolist()
        if label_encoder and hasattr(label_encoder, "classes_")
        else ['neutral', 'calm', 'happy', 'sad', 'angry', 'fearful', 'disgust', 'surprised']
    )

    # Verification log
    print(f"[INFO] Model loaded successfully from {model_path}")
    print(f"[INFO] Detected emotion classes: {EMOTIONS}")

except Exception as e:
    raise RuntimeError(f"Failed to load model: {e}")


# === Mel Spectrogram Processing ===
def get_mel_spectrogram(audio):
    mel_spec = librosa.feature.melspectrogram(
        y=audio, sr=SAMPLE_RATE, n_mels=N_MELS, n_fft=2048, hop_length=512
    )
    mel_db = librosa.power_to_db(mel_spec, ref=np.max)
    mel_db = (mel_db - mel_db.mean()) / (mel_db.std() + 1e-8)
    mel_db = np.resize(mel_db, (128, 128))  # Resize to match training
    mel_tensor = torch.tensor(mel_db).unsqueeze(0).unsqueeze(0).float()
    return mel_tensor


# === Prediction Function ===
def predict_emotion_improved(audio_array: np.ndarray) -> str:
    """Predicts the emotion class from a raw audio numpy array."""
    if len(audio_array) < TARGET_LENGTH:
        audio_array = np.pad(audio_array, (0, TARGET_LENGTH - len(audio_array)), mode='constant')
    else:
        audio_array = audio_array[:TARGET_LENGTH]

    mel_tensor = get_mel_spectrogram(audio_array)

    with torch.no_grad():
        output = model(mel_tensor)
        pred_idx = torch.argmax(output, dim=1).item()

    return EMOTIONS[pred_idx]
