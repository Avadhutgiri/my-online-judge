# Use Python base image
FROM python:3.11

# Set working directory
WORKDIR /app

# Install build dependencies (fixing typo)
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk && \ 
    apt-get install -y docker.io && \
    apt-get install -y --no-install-recommends gcc python3-dev && \
    rm -rf /var/lib/apt/lists/*

# Verify Java installation
RUN java -version && javac -version  # ✅ This ensures Java is installed

# Set JAVA_HOME environment variable
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Command will be overridden by docker-compose
CMD ["celery", "-A", "tasks", "worker", "--loglevel=info"]
