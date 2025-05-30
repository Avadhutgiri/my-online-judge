const express = require('express');
const router = express.Router();
const webHookController = require('../controllers/webHookController');

router.post('/run', webHookController.RunWebhook);

router.post('/system', webHookController.SystemWebhook);

router.post('/submit', webHookController.SubmitWebhook);

module.exports = router;
