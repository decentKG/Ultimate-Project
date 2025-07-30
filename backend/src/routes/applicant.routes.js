const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const applicantController = require('../controllers/applicant.controller');

// Applicant routes
router.get('/profile', authenticate, applicantController.getProfile);
router.put('/profile', authenticate, applicantController.updateProfile);
router.get('/applications', authenticate, applicantController.getApplications);
router.post('/applications', authenticate, applicantController.submitApplication);

module.exports = router;
