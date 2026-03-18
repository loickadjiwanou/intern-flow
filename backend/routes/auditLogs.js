import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50, action, resourceType } = req.query;
    
    const query = {};
    if (action) query.action = new RegExp(action, 'i');
    if (resourceType) query.resourceType = resourceType;
    
    const logs = await AuditLog.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await AuditLog.countDocuments(query);
    
    res.json({
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch audit logs', error: error.message });
  }
});

export default router;
