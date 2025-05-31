import json
import base64
from celery import Celery
from redis import Redis
from workers.execute_code import run, submit, runSystemcode
import requests
import os

# Environment Variables
REDIS_HOST = os.getenv('REDIS_HOST', 'redis')
# REDIS_HOST = 'localhost'
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
BACKEND_HOST = os.getenv('BACKEND_HOST', 'backend')
# BACKEND_HOST = 'localhost'
BACKEND_PORT = os.getenv('BACKEND_PORT', 5000)
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', f'redis://{REDIS_HOST}:{REDIS_PORT}/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', f'redis://{REDIS_HOST}:{REDIS_PORT}/0')

# Queue names
RUN_QUEUE = 'runQueue'
SUBMIT_QUEUE = 'submitQueue'
RUN_SYSTEM_QUEUE= 'runSystemQueue'

# Webhook URLs using environment variables
WEBHOOK_URL_RUN = f'http://{BACKEND_HOST}:{BACKEND_PORT}/webhook/run'
WEBHOOK_URL_SUBMIT = f'http://{BACKEND_HOST}:{BACKEND_PORT}/webhook/submit'
WEBHOOK_URL_SYSTEM = f'http://{BACKEND_HOST}:{BACKEND_PORT}/webhook/system'

# Configure Celery
app = Celery('tasks', broker=CELERY_BROKER_URL,backend=CELERY_RESULT_BACKEND)
app.conf.broker_heartbeat = 10
app.conf.broker_connection_timeout = 30
app.conf.worker_max_tasks_per_child = 100  # auto-restarts workers after 100 tasks
app.conf.worker_prefetch_multiplier = 1
app.conf.task_acks_late = True

# Configure Redis client
redis_client = Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=0,
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=5,
)
def reconnect_redis():
    """Reinitialize the Redis client if connection drops."""
    global redis_client
    try:
        redis_client = Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=0,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
        )
        redis_client.ping()
        print(" Redis connection re-established.")
    except Exception as e:
        print(f" Redis reconnection failed: {e}")


def store_run_result(submission_id, result):
    """Store the run result temporarily in Redis for 10 minutes."""
    try:
        redis_client.setex(f"run_result:{submission_id}", 600, json.dumps(result))
        print(f"Stored result for submission {submission_id}")
    except Exception as e:
        print(f"Error storing result: {e}")

def decode(encoded_str):
    """Decode a base64 encoded string."""
    return base64.b64decode(encoded_str).decode('utf-8')

import redis.exceptions

def fetch(queue):
    try:
        result = redis_client.brpop(queue, timeout=5)
        if result:
            print(f" Fetched item from {queue}")
        else:
            print(f"No item fetched from {queue} (timeout reached, queue likely empty).")
        return result
    except redis.exceptions.ConnectionError as e:
        print(f"Redis connection error on queue {queue}: {e}")
        reconnect_redis()
        return None
    except redis.exceptions.TimeoutError as e:
        # This is a normal idle timeout from socket — DO NOT reconnect
        print(f"Redis timeout waiting on {queue} (but connection is fine).")
        return None
    except Exception as e:
        print(f"Unexpected Redis error on queue {queue}: {e}")
        reconnect_redis()
        return None


def send_webhook_result(url, result):
    """Send the execution result to the specified webhook URL."""
    try:
        print(f"Sending webhook to {url}")
        response = requests.post(url, json=result, timeout=5)
        response.raise_for_status()
        print(f"Successfully sent webhook to {url}")
    except requests.RequestException as e:
        print(f"Failed to send webhook to {url}: {e}")

@app.task(name="tasks.process")
def process(queue):
    print(f"Processing queue: {queue}")
    for _ in range(8):
        try:
            item = fetch(queue)
            if not item:
                print(f"Queue {queue} is empty.")
                return

            _, data = item
            task = json.loads(data)
            print(f"Processing task: {task['submission_id']}")

            if  'code' in task:
                task['code'] = decode(task['code'])

            if task.get('customTestcase'):
                task['customTestcase'] = decode(task['customTestcase'])

            print(f"Processing problem_id: {task['problem_id']}")
            
            if queue == RUN_QUEUE:
                result = run(
                    task['submission_id'],
                    task['code'],
                    task['language'],
                    task['problem_id'],
                    inputData=task.get('customTestcase'),
                )

                webhook_data = {
                    'submission_id': task['submission_id'],
                    'status': result.get('status', 'failed'),
                    'message': result.get('message') or None,
                    'user_output': result.get('user_output') or None,            
                    }
                print(f"webhook_data: {webhook_data}")
                store_run_result(task['submission_id'], webhook_data)
                send_webhook_result(WEBHOOK_URL_RUN, webhook_data)
                
            elif queue == RUN_SYSTEM_QUEUE:
                result =runSystemcode(
                    task['submission_id'],
                    task['problem_id'],
                    inputData=task.get('customTestcase'),
                )

                webhook_data = {
                    'submission_id': task['submission_id'],
                    'status': result.get('status', 'failed'),
                    'message': result.get('message') or None,
                    'expected_output': result.get('expected_output')
                }

                store_run_result(task['submission_id'], webhook_data)
                send_webhook_result(WEBHOOK_URL_SYSTEM, webhook_data)
                
            else:
                result = submit(
                    submission_id=task['submission_id'],
                    code=task['code'],
                    language=task['language'],
                    problem_id=task['problem_id'],
                    input_path=task['inputPath']
                )

                webhook_data = {
                    'submission_id': task['submission_id'],
                    'status': result.get('status'),
                    'message': result.get('message') or None,
                    'failed_test_case': result.get('test_case') or None
                }

                send_webhook_result(WEBHOOK_URL_SUBMIT, webhook_data)

            print(f"Completed processing task: {task['submission_id']}")
            print(f"Result: {webhook_data}")

        except Exception as e:
            print(f"Error processing task: {e}")
            raise

# Health check task
@app.task(name="tasks.health")
def health_check():
    return "OK"

# Configure celery beat schedule
app.conf.beat_schedule = {
    'process-run-queue': {
        'task': 'tasks.process',
        'schedule': 5.0,  # every 5 seconds
        'args': (RUN_QUEUE,)
    },
    'process-submit-queue': {
        'task': 'tasks.process',
        'schedule': 5.0,  # every 5 seconds
        'args': (SUBMIT_QUEUE,)
    }
    ,
    'process-run-system-queue': {
        'task': 'tasks.process',
        'schedule': 5.0,  # every 5 seconds
        'args': (RUN_SYSTEM_QUEUE,)
    }
}

