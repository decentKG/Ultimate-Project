const express = require('express');
const router = express.Router();

// Import route modules
const chatRoutes = require('./chat.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const applicantRoutes = require('./applicant.routes');
const companyRoutes = require('./company.routes');

// API Routes
router.use('/chat', chatRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/applicants', applicantRoutes);
router.use('/companies', companyRoutes);

module.exports = router;
