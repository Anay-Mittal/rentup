const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller.js');

router.post('/', chatController.chat);

module.exports = router;
