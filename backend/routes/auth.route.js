const express = require('express');
const { registerUser, loginUser, logoutUser, fetchExternalData, getUserDetails } = require('../controllers/auth.controller.js');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser); // New logout route
router.get('/fetch-data', fetchExternalData);
router.get('/:userId',getUserDetails)

module.exports = router;
