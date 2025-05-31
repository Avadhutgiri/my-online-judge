FROM python:3.11

WORKDIR /app

RUN apt-get update && \
    apt-get install -y openjdk-17-jdk docker.io gcc python3-dev && \
    rm -rf /var/lib/apt/lists/*

RUN java -version && javac -version

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .  

CMD ["celery", "-A", "tasks", "worker", "--loglevel=DEBUG"]
