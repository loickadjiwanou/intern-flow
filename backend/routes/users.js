import express from 'express';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

router.get('/', authenticate, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, phone, avatar, department, position } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, phone, avatar, department, position },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Updated user',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip
    });
    
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// Update user role - Admin only
router.put('/:id/role', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['Admin', 'HR', 'Manager', 'Intern'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Prevent self-demotion from Admin
    if (req.user._id.toString() === req.params.id && role !== 'Admin') {
      return res.status(400).json({ message: 'Cannot change your own admin role' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: `Changed user role to ${role}`,
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip
    });
    
    // Emit WebSocket event for role change
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    const targetSocketId = connectedUsers.get(user._id.toString());
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('roleChanged', { 
        newRole: role,
        message: `Your role has been changed to ${role}`
      });
    }
    
    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role', error: error.message });
  }
});

// Toggle user active status - Admin only
router.put('/:id/status', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    // Prevent self-deactivation
    if (req.user._id.toString() === req.params.id && !isActive) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: `${isActive ? 'Activated' : 'Deactivated'} user account`,
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip
    });
    
    // Emit WebSocket event for status change
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    const targetSocketId = connectedUsers.get(user._id.toString());
    
    if (targetSocketId && !isActive) {
      io.to(targetSocketId).emit('accountDeactivated', { 
        message: 'Your account has been deactivated'
      });
    }
    
    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status', error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Deleted user',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

export default router;
