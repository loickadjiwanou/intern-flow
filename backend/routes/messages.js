import express from 'express';
import Message from '../models/Message.js';
import { authenticate } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    })
      .populate('sender', 'firstName lastName avatar')
      .populate('recipient', 'firstName lastName avatar')
      .sort({ createdAt: -1 });
    
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

router.get('/conversation/:userId', authenticate, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    })
      .populate('sender', 'firstName lastName avatar')
      .populate('recipient', 'firstName lastName avatar')
      .sort({ createdAt: 1 });
    
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversation', error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const messageData = {
      ...req.body,
      sender: req.user._id
    };
    
    const message = new Message(messageData);
    await message.save();
    
    // Populate sender info for the response
    await message.populate('sender', 'firstName lastName avatar');
    await message.populate('recipient', 'firstName lastName avatar');
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Sent message',
      resourceType: 'Message',
      resourceId: message._id.toString(),
      ipAddress: req.ip
    });
    
    // Emit WebSocket event for new message
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    const recipientSocketId = connectedUsers.get(req.body.recipient);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('newMessage', {
        message,
        senderName: `${req.user.firstName} ${req.user.lastName}`
      });
    }
    
    res.status(201).json({ message: 'Message sent successfully', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({ message: 'Message marked as read', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update message', error: error.message });
  }
});

export default router;
