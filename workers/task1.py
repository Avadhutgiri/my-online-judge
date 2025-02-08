import json
import base64
from celery import Celery
from redis import Redis

# Config
app = Celery('tasks', broker='redis://localhost:6379/0')
redis_client = Redis(host='localhost', port=6379, db=0)

REDIS_HOST = 'localhost'
REDIS_PORT = 6379
RUN_QUEUE = 'runQ'
SUBMIT_QUEUE = 'submitQ'

def decode(encoded):
    return base64.b64decode(encoded).decode('utf-8')

def fetch(queue):
    return redis_client.brpop(queue, timeout=5)

@app.task(name="tasks.process")
def process(queue):
    try:
        item = fetch(queue)
        if not item:
            print(f"{queue} is empty.")
            return

        _, data = item
        task = json.loads(data)
        task['code'] = decode(task['code'])
        if 'customTestcase' in task:
            task['customTestcase'] = decode(task['customTestcase'])

        print(f"Processing task from {queue}: {task}")

    except Exception as e:
        print(f"Error processing {queue}: {e}")

# Shortened schedule
app.conf.beat_schedule = {
    'run': {'task': 'process', 'schedule': 1.0, 'args': (RUN_QUEUE,)},
    'submit': {'task': 'process', 'schedule': 1.0, 'args': (SUBMIT_QUEUE,)},
}
