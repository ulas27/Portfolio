# Multi-stage Docker build for İnci Gold
# Production-ready container with security hardening

# Build stage
FROM python:3.11-slim as builder

# Add metadata
LABEL maintainer="Inci Gold Development Team" \
      description="Production-ready container for İnci Gold E-commerce Platform" \
      version="1.0.0"

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DEBIAN_FRONTEND=noninteractive

# Install system dependencies with security updates
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y \
    build-essential \
    libpq-dev \
    libssl-dev \
    libffi-dev \
    pkg-config \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create and activate virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements first for better layer caching
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel && \
    pip install -r requirements.txt && \
    pip cache purge

# Production stage
FROM python:3.11-slim as production

# Add metadata
LABEL maintainer="Inci Gold Development Team" \
      description="Production container for İnci Gold E-commerce Platform" \
      version="1.0.0"

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    FLASK_APP=app.py \
    FLASK_ENV=production \
    DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

# Install minimal runtime dependencies with security updates
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    libpq5 \
    libssl3 \
    libffi8 \
    curl \
    dumb-init \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    # Remove unnecessary files for security
    rm -f /usr/bin/curl

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv

# Create non-root user with minimal privileges
RUN groupadd -r -g 1001 incigold && \
    useradd -r -u 1001 -g incigold -s /sbin/nologin -c "Inci Gold Application User" incigold && \
    mkdir -p /app && \
    chown -R incigold:incigold /app

# Create application directory
WORKDIR /app

# Copy application code with proper ownership
COPY --chown=incigold:incigold . .

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /app/static/uploads /app/instance && \
    chown -R incigold:incigold /app && \
    chmod 755 /app && \
    chmod 755 /app/logs && \
    chmod 755 /app/static && \
    chmod 755 /app/static/uploads && \
    chmod 755 /app/instance

# Switch to non-root user
USER incigold

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/health')" || exit 1

# Expose port
EXPOSE 5000

# Run application with proper signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["gunicorn", \
     "--bind", "0.0.0.0:5000", \
     "--workers", "4", \
     "--worker-class", "gevent", \
     "--worker-connections", "1000", \
     "--max-requests", "1000", \
     "--max-requests-jitter", "100", \
     "--timeout", "30", \
     "--keep-alive", "2", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--log-level", "info", \
     "app:app"]