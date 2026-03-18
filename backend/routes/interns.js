import express from 'express';
import Intern from '../models/Intern.js';
import { authenticate, authorize } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, department, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    
    const interns = await Intern.find(query)
      .populate('manager', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Intern.countDocuments(query);
    
    res.json({
      interns,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch interns', error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id)
      .populate('manager', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName');
    
    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }
    
    res.json({ intern });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch intern', error: error.message });
  }
});

router.post('/', authenticate, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const internData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const intern = new Intern(internData);
    await intern.save();
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Created intern',
      resourceType: 'Intern',
      resourceId: intern._id.toString(),
      ipAddress: req.ip
    });
    
    res.status(201).json({ message: 'Intern created successfully', intern });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create intern', error: error.message });
  }
});

router.put('/:id', authenticate, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const intern = await Intern.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('manager', 'firstName lastName email');
    
    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Updated intern',
      resourceType: 'Intern',
      resourceId: intern._id.toString(),
      details: JSON.stringify(req.body),
      ipAddress: req.ip
    });
    
    res.json({ message: 'Intern updated successfully', intern });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update intern', error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const intern = await Intern.findByIdAndDelete(req.params.id);
    
    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Deleted intern',
      resourceType: 'Intern',
      resourceId: intern._id.toString(),
      ipAddress: req.ip
    });
    
    res.json({ message: 'Intern deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete intern', error: error.message });
  }
});

router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const totalInterns = await Intern.countDocuments();
    const activeInterns = await Intern.countDocuments({ status: 'Active Intern' });
    const completedInterns = await Intern.countDocuments({ status: 'Internship Completed' });
    const hiredInterns = await Intern.countDocuments({ status: 'Hired' });
    
    const byDepartment = await Intern.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    
    const byStatus = await Intern.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalInterns,
      activeInterns,
      completedInterns,
      hiredInterns,
      byDepartment,
      byStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

export default router;
