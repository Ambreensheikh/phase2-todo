# Stage 1: Install dependencies
FROM python:3.11-slim as builder

WORKDIR /app

RUN pip install poetry
RUN poetry config virtualenvs.in-project true

# Copy only the dependency definition files from the backend directory
COPY backend/pyproject.toml backend/poetry.lock* ./

# Install dependencies into a virtual environment
RUN poetry install --no-root

# Stage 2: Create the final production image
FROM python:3.11-slim

WORKDIR /app

# Copy the virtual environment from the builder stage
COPY --from=builder /app/.venv ./.venv
ENV PATH="/app/.venv/bin:$PATH"

# Copy the backend application code
COPY backend/ ./backend/

# Expose the port the app runs on
EXPOSE 8005

# Command to run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8005"]
