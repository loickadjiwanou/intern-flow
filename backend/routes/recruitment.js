import express from 'express';
import { Recruitment, Application } from '../models/Recruitment.js';
import { authenticate, authorize } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Recruitment.find({ isActive: true })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
  }
});

router.post('/jobs', authenticate, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const job = new Recruitment(jobData);
    await job.save();
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Created job offer',
      resourceType: 'Recruitment',
      resourceId: job._id.toString(),
      ipAddress: req.ip
    });
    
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create job', error: error.message });
  }
});

router.get('/applications', authenticate, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const { recruitment, status } = req.query;
    
    const query = {};
    if (recruitment) query.recruitment = recruitment;
    if (status) query.status = status;
    
    const applications = await Application.find(query)
      .populate('recruitment', 'title department')
      .sort({ createdAt: -1 });
    
    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
});

router.post('/applications', async (req, res) => {
  try {
    const application = new Application(req.body);
    await application.save();
    
    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit application', error: error.message });
  }
});

router.put('/applications/:id', authenticate, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Updated application',
      resourceType: 'Application',
      resourceId: application._id.toString(),
      ipAddress: req.ip
    });
    
    res.json({ message: 'Application updated successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update application', error: error.message });
  }
});

export default router;
