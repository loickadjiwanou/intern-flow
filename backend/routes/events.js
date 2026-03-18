import express from 'express';
import Event from '../models/Event.js';
import { authenticate, authorize } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all events
router.get('/', authenticate, async (req, res) => {
  try {
    const { start, end, type } = req.query;
    
    const query = {};
    if (start && end) {
      query.start = { $gte: new Date(start), $lte: new Date(end) };
    }
    if (type) query.type = type;
    
    const events = await Event.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('participants', 'firstName lastName email')
      .populate('intern', 'firstName lastName')
      .sort({ start: 1 });
    
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
});

// Get single event
router.get('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('participants', 'firstName lastName email avatar')
      .populate('intern', 'firstName lastName');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
});

// Create event
router.post('/', authenticate, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user._id,
    };
    
    const event = new Event(eventData);
    await event.save();
    
    // Notify participants
    if (req.body.participants && req.body.participants.length > 0) {
      const notifications = req.body.participants.map(participantId => ({
        recipient: participantId,
        type: 'Event',
        title: 'New event invitation',
        message: `You have been invited to: ${event.title}`,
        link: `/calendar`,
      }));
      await Notification.insertMany(notifications);
    }
    
    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('eventCreated', { event });
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Created event',
      resourceType: 'Event',
      resourceId: event._id.toString(),
      ipAddress: req.ip,
    });
    
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
});

// Update event
router.put('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('createdBy', 'firstName lastName')
      .populate('participants', 'firstName lastName email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('eventUpdated', { event });
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Updated event',
      resourceType: 'Event',
      resourceId: event._id.toString(),
      ipAddress: req.ip,
    });
    
    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
});

// Delete event
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('eventDeleted', { eventId: event._id });
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Deleted event',
      resourceType: 'Event',
      resourceId: event._id.toString(),
      ipAddress: req.ip,
    });
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
});

export default router;
