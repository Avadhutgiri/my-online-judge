import os
import json
import base64
import requests
from celery import Celery
from redis import Redis
from execute_code import run, submit, runSystemcode

# ─── Configuration ─────────────────────────────────────────────────────

REDIS_HOST = os.getenv('REDIS_HOST', 'redis')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
BACKEND_HOST = os.getenv('BACKEND_HOST', 'backend')
BACKEND_PORT = int(os.getenv('BACKEND_PORT', 5000))

CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', f'redis://{REDIS_HOST}:{REDIS_PORT}/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', f'redis://{REDIS_HOST}:{REDIS_PORT}/0')

WEBHOOK_URL_RUN = f'http://{BACKEND_HOST}:{BACKEND_PORT}/webhook/run'
WEBHOOK_URL_SUBMIT = f'http://{BACKEND_HOST}:{BACKEND_PORT}/webhook/submit'
WEBHOOK_URL_SYSTEM = f'http://{BACKEND_HOST}:{BACKEND_PORT}/webhook/system'

# ─── Initialize Celery ──────────────────────────────────────────────────

app = Celery('tasks', broker=CELERY_BROKER_URL, backend=CELERY_RESULT_BACKEND)
app.conf.update(
    broker_heartbeat=10,
    broker_connection_timeout=30,
    worker_max_tasks_per_child=100,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)

# ─── Redis Client for Temporary Run Result Caching ─────────────────────

redis_client = Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=0,
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=5,
)

def store_run_result(submission_id, result):
    """Temporarily store run/system result in Redis (TTL: 10 minutes)."""
    try:
        redis_client.setex(f"run_result:{submission_id}", 600, json.dumps(result))
        print(f"[Redis] Stored result for {submission_id}")
    except Exception as e:
        print(f"[Redis] Error storing result: {e}")

# ─── Utility Functions ──────────────────────────────────────────────────

def decode(encoded_str):
    """Base64 decode utility."""
    return base64.b64decode(encoded_str).decode('utf-8')

def send_webhook_result(url, data):
    """POST result to webhook endpoint."""
    try:
        print(f"[Webhook] Sending to {url}")
        r = requests.post(url, json=data, timeout=5)
        r.raise_for_status()
        print("[Webhook] Sent successfully.")
    except Exception as e:
        print(f"[Webhook] Failed to send: {e}")

# ─── Task: Code Submission ──────────────────────────────────────────────

@app.task(name="tasks.submit_code", queue="submitQueue")
def submit_code(data):
    data['code'] = decode(data['code'])

    result = submit(
        submission_id=data['submission_id'],
        code=data['code'],
        language=data['language'],
        problem_id=data['problem_id'],
        input_path=data['inputPath']
    )

    webhook_data = {
        'submission_id': data['submission_id'],
        'status': result.get('status'),
        'message': result.get('message'),
        'failed_test_case': result.get('test_case')
    }

    send_webhook_result(WEBHOOK_URL_SUBMIT, webhook_data)

# ─── Task: User Run Code ────────────────────────────────────────────────

@app.task(name="tasks.run_code", queue="runQueue")
def run_code(data):
    data['code'] = decode(data['code'])
    if data.get('customTestcase'):
        data['customTestcase'] = decode(data['customTestcase'])

    result = run(
        submission_id=data['submission_id'],
        code=data['code'],
        language=data['language'],
        problem_id=data['problem_id'],
        inputData=data.get('customTestcase')
    )

    webhook_data = {
        'submission_id': data['submission_id'],
        'status': result.get('status'),
        'message': result.get('message'),
        'user_output': result.get('user_output')
    }

    store_run_result(data['submission_id'], webhook_data)
    send_webhook_result(WEBHOOK_URL_RUN, webhook_data)

# ─── Task: Run System Code ──────────────────────────────────────────────

@app.task(name="tasks.run_system_code", queue="runSystemQueue")
def run_system_code(data):
    if data.get('customTestcase'):
        data['customTestcase'] = decode(data['customTestcase'])

    result = runSystemcode(
        submission_id=data['submission_id'],
        problem_id=data['problem_id'],
        inputData=data.get('customTestcase')
    )

    webhook_data = {
        'submission_id': data['submission_id'],
        'status': result.get('status'),
        'message': result.get('message'),
        'expected_output': result.get('expected_output')
    }

    store_run_result(data['submission_id'], webhook_data)
    send_webhook_result(WEBHOOK_URL_SYSTEM, webhook_data)

# ─── Health Check Task ──────────────────────────────────────────────────

@app.task(name="tasks.health")
def health_check():
    return "OK"
