const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

// Resume analysis endpoint
router.post(
  '/analyze', 
  authenticate, 
  upload.single('resume'),
  resumeController.analyzeResume
);

module.exports = router;
