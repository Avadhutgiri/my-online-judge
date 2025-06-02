from flask import Flask, request, jsonify
from tasks import submit_code, run_code, run_system_code

app = Flask(__name__)

@app.route('/enqueue/submit', methods=['POST'])
def enqueue_submit():
    data = request.get_json()
    submit_code.delay(data)
    return jsonify({"message": "Submit task enqueued"}), 200

@app.route('/enqueue/run', methods=['POST'])
def enqueue_run():
    data = request.get_json()
    run_code.delay(data)
    return jsonify({"message": "Run task enqueued"}), 200

@app.route('/enqueue/system', methods=['POST'])
def enqueue_system():
    data = request.get_json()
    run_system_code.delay(data)
    return jsonify({"message": "System run task enqueued"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
