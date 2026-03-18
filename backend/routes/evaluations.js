import express from 'express';
import Evaluation from '../models/Evaluation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { intern, type } = req.query;
    
    const query = {};
    if (intern) query.intern = intern;
    if (type) query.type = type;
    
    const evaluations = await Evaluation.find(query)
      .populate('intern', 'firstName lastName email photo')
      .populate('evaluator', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({ evaluations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch evaluations', error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id)
      .populate('intern', 'firstName lastName email photo')
      .populate('evaluator', 'firstName lastName avatar');
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    res.json({ evaluation });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch evaluation', error: error.message });
  }
});

router.post('/', authenticate, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const evaluationData = {
      ...req.body,
      evaluator: req.user._id
    };
    
    const scores = [
      req.body.criteria.technicalSkills.score,
      req.body.criteria.communication.score,
      req.body.criteria.autonomy.score,
      req.body.criteria.teamwork.score,
      req.body.criteria.deadlineRespect.score
    ];
    
    evaluationData.overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    const evaluation = new Evaluation(evaluationData);
    await evaluation.save();
    
    await Notification.create({
      recipient: req.body.intern,
      type: 'Evaluation',
      title: 'New evaluation available',
      message: `Your ${req.body.type} evaluation is now available`,
      link: `/evaluations/${evaluation._id}`
    });
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Created evaluation',
      resourceType: 'Evaluation',
      resourceId: evaluation._id.toString(),
      ipAddress: req.ip
    });
    
    res.status(201).json({ message: 'Evaluation created successfully', evaluation });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create evaluation', error: error.message });
  }
});

router.put('/:id', authenticate, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const evaluation = await Evaluation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Updated evaluation',
      resourceType: 'Evaluation',
      resourceId: evaluation._id.toString(),
      ipAddress: req.ip
    });
    
    res.json({ message: 'Evaluation updated successfully', evaluation });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update evaluation', error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Deleted evaluation',
      resourceType: 'Evaluation',
      resourceId: evaluation._id.toString(),
      ipAddress: req.ip
    });
    
    res.json({ message: 'Evaluation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete evaluation', error: error.message });
  }
});

export default router;
