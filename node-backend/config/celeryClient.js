// config/celeryClient.js
const celery = require('celery-node');

const client = celery.createClient(
  'redis://redis:6379/0',  // broker URL
  'redis://redis:6379/0'   // backend URL
);

// Optional: Configure task routing
client.conf.TASK_ROUTES = {
  submit_code_task: 'celery',
  run_code_task: 'celery',
  run_system_task: 'celery'
};

module.exports = client;
