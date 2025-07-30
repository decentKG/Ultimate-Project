const express = require('express');
const router = express.Router();
const path = require('path');

// Import route modules
const chatRoutes = require('./chat.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const applicantRoutes = require('./applicant.routes');
const companyRoutes = require('./company.routes');
const jobRoutes = require('./job.routes');
const resumeRoutes = require('./resume.routes');

// API Routes
router.use('/chat', chatRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/applicants', applicantRoutes);
router.use('/companies', companyRoutes);
router.use('/jobs', jobRoutes);
router.use('/resumes', resumeRoutes);

// Serve uploaded files
router.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

module.exports = router;
