import express from 'express';
import Task from '../models/Task.js';
import { authenticate, authorize } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, assignedTo, priority } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (priority) query.priority = priority;
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'firstName lastName email photo')
      .populate('assignedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email photo')
      .populate('assignedBy', 'firstName lastName')
      .populate('comments.user', 'firstName lastName avatar');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch task', error: error.message });
  }
});

router.post('/', authenticate, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      assignedBy: req.user._id
    };
    
    const task = new Task(taskData);
    await task.save();
    
    await Notification.create({
      recipient: req.body.assignedTo,
      type: 'Task',
      title: 'New task assigned',
      message: `You have been assigned a new task: ${task.title}`,
      link: `/tasks/${task._id}`
    });
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Created task',
      resourceType: 'Task',
      resourceId: task._id.toString(),
      ipAddress: req.ip
    });
    
    // Emit WebSocket event for new task
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    
    if (req.body.assignedTo) {
      const targetSocketId = connectedUsers.get(req.body.assignedTo);
      if (targetSocketId) {
        io.to(targetSocketId).emit('newTask', {
          task,
          message: `New task assigned: ${task.title}`
        });
      }
    }
    
    // Broadcast to all users for Kanban update
    io.emit('taskCreated', { task });
    
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('assignedTo', 'firstName lastName email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Updated task',
      resourceType: 'Task',
      resourceId: task._id.toString(),
      ipAddress: req.ip
    });
    
    // Emit WebSocket event for task update
    const io = req.app.get('io');
    io.emit('taskUpdated', { task });
    
    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
});

router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task.comments.push({
      user: req.user._id,
      text
    });
    
    await task.save();
    
    res.json({ message: 'Comment added successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Deleted task',
      resourceType: 'Task',
      resourceId: task._id.toString(),
      ipAddress: req.ip
    });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
});

export default router;
