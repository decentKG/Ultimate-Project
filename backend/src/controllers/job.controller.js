const JobPosting = require('../models/job.model');
const { validationResult } = require('express-validator');

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private/Admin
const createJobPosting = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      department,
      location,
      type,
      description,
      salary,
      experience,
      requirements
    } = req.body;

    const jobPosting = new JobPosting({
      title,
      department,
      location,
      type,
      description,
      salary,
      experience,
      requirements: requirements.filter((req) => req.trim() !== ''),
      postedBy: req.user.id,
      company: req.user.company
    });

    await jobPosting.save();
    
    res.status(201).json({
      success: true,
      data: jobPosting
    });
  } catch (error) {
    console.error('Error creating job posting:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all job postings
// @route   GET /api/jobs
// @access  Public
const getJobPostings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department,
      location,
      type,
      status
    } = req.query;

    const query = {};
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filtering
    if (department) query.department = department;
    if (location) query.location = location;
    if (type) query.type = type;
    if (status) query.status = status;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: [
        { path: 'postedBy', select: 'name email' },
        { path: 'company', select: 'name logo' }
      ]
    };

    const jobs = await JobPosting.paginate(query, options);
    
    res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching job postings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single job posting
// @route   GET /api/jobs/:id
// @access  Public
const getJobPosting = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id)
      .populate('postedBy', 'name email')
      .populate('company', 'name logo');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching job posting:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update job posting
// @route   PUT /api/jobs/:id
// @access  Private/Admin
const updateJobPosting = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      department,
      location,
      type,
      status,
      description,
      salary,
      experience,
      requirements
    } = req.body;

    let job = await JobPosting.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Check if user is authorized to update this job posting
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job posting'
      });
    }

    // Update job posting
    job.title = title || job.title;
    job.department = department || job.department;
    job.location = location || job.location;
    job.type = type || job.type;
    job.status = status || job.status;
    job.description = description || job.description;
    job.salary = salary !== undefined ? salary : job.salary;
    job.experience = experience || job.experience;
    job.requirements = requirements ? requirements.filter((req) => req.trim() !== '') : job.requirements;

    await job.save();

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error updating job posting:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete job posting
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
const deleteJobPosting = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Check if user is authorized to delete this job posting
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job posting'
      });
    }

    await job.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting job posting:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get job posting statistics
// @route   GET /api/jobs/stats
// @access  Private/Admin
const getJobStats = async (req, res) => {
  try {
    const stats = await JobPosting.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$count' },
          statuses: {
            $push: {
              status: '$_id',
              count: '$count'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          statuses: 1
        }
      }
    ]);

    // Get applications count per job for the last 6 months
    const applicationsStats = await JobPosting.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $project: {
          month: { $month: '$createdAt' },
          applications: 1
        }
      },
      {
        $group: {
          _id: '$month',
          applications: { $sum: '$applications' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get top departments with most job postings
    const topDepartments = await JobPosting.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...(stats[0] || { total: 0, statuses: [] }),
        applicationsStats,
        topDepartments
      }
    });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createJobPosting,
  getJobPostings,
  getJobPosting,
  updateJobPosting,
  deleteJobPosting,
  getJobStats
};
