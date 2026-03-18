import express from 'express';
import Report from '../models/Report.js';
import { authenticate, authorize } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { intern, type, status } = req.query;
    
    const query = {};
    if (intern) query.intern = intern;
    if (type) query.type = type;
    if (status) query.status = status;
    
    const reports = await Report.find(query)
      .populate('intern', 'firstName lastName email photo')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ date: -1 });
    
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('intern', 'firstName lastName email photo')
      .populate('reviewedBy', 'firstName lastName avatar');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json({ report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch report', error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Submitted report',
      resourceType: 'Report',
      resourceId: report._id.toString(),
      ipAddress: req.ip
    });
    
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit report', error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Updated report',
      resourceType: 'Report',
      resourceId: report._id.toString(),
      ipAddress: req.ip
    });
    
    res.json({ message: 'Report updated successfully', report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update report', error: error.message });
  }
});

router.post('/:id/review', authenticate, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const { status, reviewComment } = req.body;
    
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    report.status = status;
    report.reviewComment = reviewComment;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    
    await report.save();
    
    await Notification.create({
      recipient: report.intern,
      type: 'Report',
      title: 'Report reviewed',
      message: `Your ${report.type} report has been ${status}`,
      link: `/reports/${report._id}`
    });
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Reviewed report',
      resourceType: 'Report',
      resourceId: report._id.toString(),
      ipAddress: req.ip
    });
    
    res.json({ message: 'Report reviewed successfully', report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to review report', error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Deleted report',
      resourceType: 'Report',
      resourceId: report._id.toString(),
      ipAddress: req.ip
    });
    
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete report', error: error.message });
  }
});

export default router;
