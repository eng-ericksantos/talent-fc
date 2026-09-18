FROM python:3.11-slim

WORKDIR /app

# Instala deps antes de copiar o código para aproveitar cache de camadas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY data/ ./data/

EXPOSE 8000

# Muda para src/ para que os imports relativos (db_config, math_engine) funcionem corretamente
WORKDIR /app/src
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
