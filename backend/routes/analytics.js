import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Intern from '../models/Intern.js';
import Task from '../models/Task.js';
import Evaluation from '../models/Evaluation.js';
import Report from '../models/Report.js';
import { Application } from '../models/Recruitment.js';

const router = express.Router();

router.get('/overview', authenticate, async (req, res) => {
  try {
    const totalInterns = await Intern.countDocuments();
    const activeInterns = await Intern.countDocuments({ status: 'Active Intern' });
    const completedInterns = await Intern.countDocuments({ status: 'Internship Completed' });
    const hiredInterns = await Intern.countDocuments({ status: 'Hired' });
    
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Done' });
    const pendingReports = await Report.countDocuments({ status: 'Pending' });
    const totalApplications = await Application.countDocuments();
    
    const internsByDepartment = await Intern.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const internsByStatus = await Intern.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const tasksByStatus = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const recentEvaluations = await Evaluation.find()
      .populate('intern', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      stats: {
        totalInterns,
        activeInterns,
        completedInterns,
        hiredInterns,
        totalTasks,
        completedTasks,
        pendingReports,
        totalApplications
      },
      charts: {
        internsByDepartment,
        internsByStatus,
        tasksByStatus,
        applicationsByStatus
      },
      recentEvaluations
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

router.get('/performance', authenticate, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const evaluations = await Evaluation.find()
      .populate('intern', 'firstName lastName department')
      .sort({ createdAt: -1 });
    
    const performanceByIntern = evaluations.reduce((acc, evaluation) => {
      const internId = evaluation.intern._id.toString();
      if (!acc[internId]) {
        acc[internId] = {
          intern: evaluation.intern,
          scores: [],
          average: 0
        };
      }
      acc[internId].scores.push(evaluation.overallScore);
      return acc;
    }, {});
    
    Object.keys(performanceByIntern).forEach(internId => {
      const scores = performanceByIntern[internId].scores;
      performanceByIntern[internId].average = scores.reduce((a, b) => a + b, 0) / scores.length;
    });
    
    res.json({ performanceByIntern: Object.values(performanceByIntern) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch performance data', error: error.message });
  }
});

// Get stats for Analytics page
router.get('/stats', authenticate, async (req, res) => {
  try {
    const totalInterns = await Intern.countDocuments();
    const activeInterns = await Intern.countDocuments({ status: 'Active Intern' });
    const hiredInterns = await Intern.countDocuments({ status: 'Hired' });
    
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Done' });
    
    const evaluations = await Evaluation.find();
    const averageScore = evaluations.length > 0 
      ? (evaluations.reduce((sum, e) => sum + (e.overallScore || 0), 0) / evaluations.length).toFixed(1)
      : '0.0';
    
    const conversionRate = totalInterns > 0 
      ? Math.round((hiredInterns / totalInterns) * 100) + '%'
      : '0%';
    
    res.json({
      stats: {
        totalInterns,
        activeInterns,
        hiredInterns,
        totalTasks,
        completedTasks,
        averageScore,
        conversionRate
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

export default router;
