FROM python:3.11-slim

# 🔥 SYSTEM DEPENDENCIES (ADD KIYA)
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    fonts-dejavu-core \
    fonts-liberation \
    libnss3 libgconf-2-4 libxi6 libxcursor1 \
    libxcomposite1 libxdamage1 libxrandr2 \
    libgbm1 libasound2 libatk1.0-0 libgtk-3-0 \
    libappindicator3-1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependencies pehle install karo (caching ke liye)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bot files copy karo
COPY . .

# Folders create karo
RUN mkdir -p memes logs

# Health check
HEALTHCHECK --interval=5m --timeout=30s --retries=3 \
  CMD python -c "from bot import health_check; s=health_check(); exit(0 if s['twitter_auth'] else 1)"

CMD ["python", "main.py"]
