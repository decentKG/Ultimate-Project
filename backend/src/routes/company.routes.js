const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const companyController = require('../controllers/company.controller');

// Company routes
router.get('/profile', authenticate, companyController.getProfile);
router.put('/profile', authenticate, companyController.updateProfile);
router.get('/jobs', authenticate, companyController.getCompanyJobs);
router.post('/jobs', authenticate, companyController.createJob);

module.exports = router;
