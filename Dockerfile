# ============================================================
#  Dockerfile — Kisi bhi server pe deploy karne ke liye
# ============================================================

FROM python:3.11-slim

# System dependencies (PIL ke liye fonts chahiye)
RUN apt-get update && apt-get install -y \
    fonts-dejavu-core \
    fonts-liberation \
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
