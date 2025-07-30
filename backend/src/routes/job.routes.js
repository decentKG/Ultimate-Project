const express = require('express');
const { check } = require('express-validator');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createJobPosting,
  getJobPostings,
  getJobPosting,
  updateJobPosting,
  deleteJobPosting,
  getJobStats
} = require('../controllers/job.controller');

const router = express.Router();

// Validation middleware
const jobValidation = [
  check('title', 'Title is required').not().isEmpty(),
  check('department', 'Department is required').not().isEmpty(),
  check('location', 'Location is required').not().isEmpty(),
  check('type', 'Valid job type is required').isIn([
    'full-time',
    'part-time',
    'contract',
    'internship',
    'temporary'
  ]),
  check('description', 'Description is required').not().isEmpty(),
  check('requirements', 'At least one requirement is required').isArray({ min: 1 })
];

// Public routes
router.get('/', getJobPostings);
router.get('/:id', getJobPosting);

// Apply authentication middleware to all routes below
router.use((req, res, next) => {
  protect(req, res, next);
});

// Routes that require authentication
router.post(
  '/',
  authorize('admin', 'recruiter'),
  jobValidation,
  createJobPosting
);

router.put(
  '/:id',
  authorize('admin', 'recruiter'),
  jobValidation,
  updateJobPosting
);

router.delete(
  '/:id',
  authorize('admin', 'recruiter'),
  deleteJobPosting
);

// Admin only routes
router.get(
  '/stats/overview',
  authorize('admin'),
  getJobStats
);

module.exports = router;
