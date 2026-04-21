FROM python:3.11-slim

# 🔥 UPDATED SYSTEM DEPENDENCIES (FIXED)
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    fonts-dejavu-core \
    fonts-liberation \
    libnss3 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libatk1.0-0 \
    libgtk-3-0 \
    libxshmfence1 \
    libglu1-mesa \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p memes logs

CMD ["python", "main.py"]
