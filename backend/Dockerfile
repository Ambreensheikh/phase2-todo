# Stage 1: Dependency Builder
FROM python:3.11-slim as builder

WORKDIR /app

# Install system deps required for building some python packages
RUN apt-get update && apt-get install -y build-essential curl

# Install Poetry
RUN pip install poetry
RUN poetry config virtualenvs.in-project true

# Copy dependency files
COPY backend/pyproject.toml backend/poetry.lock* ./

# 🔥 CRITICAL FIX: Dummy README banayein taake Poetry crash na ho
RUN touch README.md

# Install dependencies (Production only, no root package installation)
RUN poetry install --no-root --only main

# Stage 2: Production Runner (Lightweight)
FROM python:3.11-slim

WORKDIR /app

# Copy virtual env from builder
COPY --from=builder /app/.venv ./.venv
ENV PATH="/app/.venv/bin:$PATH"

# Copy application code
COPY backend/ ./backend/

# Expose port
EXPOSE 8005

# Run application
# Hum root se chala rahe hain taake imports sahi kaam karein
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8005"]