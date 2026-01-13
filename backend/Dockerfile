# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (ffmpeg for yt-dlp audio processing)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (HF default is 7860)
EXPOSE 7860

# Set environment variables
ENV PORT=7860
ENV HOST=0.0.0.0

# Set up user for Hugging Face
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user
ENV PATH=/home/user/.local/bin:$PATH
WORKDIR $HOME/app

# Copy application code with correct ownership
COPY --chown=user . .

# Run the application
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port 7860"]
