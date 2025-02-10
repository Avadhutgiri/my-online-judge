import json
import base64
from celery import Celery
from redis import Redis
from workers.execute_code import run, submit
import requests  # For webhook

# Environment Variables
REDIS_HOST = 'localhost'
REDIS_PORT = 6379
RUN_QUEUE = 'runQueue'
SUBMIT_QUEUE = 'submitQueue'
# Change these URLs based on your server setup
WEBHOOK_URL_RUN = 'http://localhost:5000/webhook/run'
WEBHOOK_URL_SUBMIT = 'http://localhost:5000/webhook/submit'

# Configure Celery and Redis
app = Celery('tasks', broker='redis://localhost:6379/0')
redis_client = Redis(host='localhost', port=6379, db=0)


def store_run_result(submission_id, result):
    """Store the run result temporarily in Redis for 10 minutes."""
    redis_client.setex(f"run_result:{submission_id}", 10, json.dumps(
        result))  # Expires after 10 minutes


# Helper functions
def decode(encoded_str):
    """Decode a base64 encoded string."""
    return base64.b64decode(encoded_str).decode('utf-8')


def fetch(queue):
    """Fetch an item from the Redis queue."""
    return redis_client.brpop(queue, timeout=5)


def send_webhook_result(url, result):
    """Send the execution result to the specified webhook URL."""
    try:
        response = requests.post(url, json=result, timeout=5)
        response.raise_for_status()
        print(f"Successfully sent webhook to {url}")
    except requests.RequestException as e:
        print(f"Failed to send webhook to {url}: {e}")


# Celery task for processing queues
@app.task(name="tasks.process")
def process(queue):
    try:
        item = fetch(queue)
        if not item:
            print(f"Queue {queue} is empty.")
            return

        _, data = item
        task = json.loads(data)

        if task['code']:
            task['code'] = decode(task['code'])

        if task.get('customTestcase'):
            task['customTestcase'] = decode(task['customTestcase'])

        print(task['problem_id'])
        # Execution logic for runQueue
        if queue == 'runQueue':
            result = run(
                task['submission_id'],
                task['code'],
                task['language'],
                task['problem_id'],
                inputData=task.get('customTestcase'),
                event_name=task.get('event', 'Clash')
            )

            store_run_result(task['submission_id'], {
                'status': result.get('status', 'failed'),
                'message': result.get('message') or None,
                'user_output': result.get('user_output') or None,
                'expected_output': result.get('expected_output')
            })

            # Prepare webhook data for run request
            webhook_data = {
                'submission_id': task['submission_id'],
                'status': result.get('status', 'failed'),
                # Optional error message
                'message': result.get('message') or None,
                # Output of user's code
                'user_output': result.get('user_output') or None,
                # Expected output for Reverse Coding
                'expected_output': result.get('expected_output')
            }

            send_webhook_result(WEBHOOK_URL_RUN, webhook_data)
            
            print()

        # Execution logic for submitQueue
        else:
            result = submit(
                submission_id=task['submission_id'],
                code=task['code'],
                language=task['language'],
                problem_id=task['problem_id'],
                input_path=task['inputPath']
            )

            # Prepare webhook data for submit request
            webhook_data = {
                'submission_id': task['submission_id'],
                'status': result.get('status'),
                # Error or success message
                'message': result.get('message') or None,
                # Optional for failed test cases
                'failed_test_case': result.get('failed_test_case') or None
            }

            send_webhook_result(WEBHOOK_URL_SUBMIT, webhook_data)

        print(webhook_data)
        print(f"Result for {task['submission_id']}: {result}")

    except Exception as e:
        print(f"Error processing task: {e}")
