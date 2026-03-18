import express from 'express';
import Intern from '../models/Intern.js';
import Task from '../models/Task.js';
import Document from '../models/Document.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ results: [], total: 0 });
    }
    
    const searchRegex = new RegExp(q.trim(), 'i');
    
    // Search in interns
    const interns = await Intern.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
        { position: searchRegex },
        { university: searchRegex }
      ]
    }).limit(5).select('firstName lastName email status department position');
    
    // Search in tasks
    const tasks = await Task.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex }
      ]
    }).limit(5).select('title status priority deadline');
    
    // Search in documents
    const documents = await Document.find({
      $or: [
        { fileName: searchRegex },
        { type: searchRegex }
      ]
    }).limit(5).select('fileName type createdAt');
    
    // Search in users
    const users = await User.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ]
    }).limit(5).select('firstName lastName email role');
    
    const results = [
      ...interns.map(i => ({
        _id: i._id,
        type: 'intern',
        title: `${i.firstName} ${i.lastName}`,
        subtitle: i.email,
        status: i.status,
        url: `/interns/${i._id}`
      })),
      ...tasks.map(t => ({
        _id: t._id,
        type: 'task',
        title: t.title,
        subtitle: t.status,
        status: t.priority,
        url: `/tasks`
      })),
      ...documents.map(d => ({
        _id: d._id,
        type: 'document',
        title: d.fileName,
        subtitle: d.type,
        url: `/documents`
      })),
      ...users.map(u => ({
        _id: u._id,
        type: 'user',
        title: `${u.firstName} ${u.lastName}`,
        subtitle: u.role,
        url: `/settings`
      }))
    ];
    
    res.json({
      results,
      total: results.length,
      counts: {
        interns: interns.length,
        tasks: tasks.length,
        documents: documents.length,
        users: users.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

export default router;
