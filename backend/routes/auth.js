import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../config/jwt.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || 'Intern'
    });
    
    await user.save();
    
    await AuditLog.create({
      user: user._id,
      action: 'User registered',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip
    });
    
    const token = generateToken(user._id, user.role);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    await AuditLog.create({
      user: user._id,
      action: 'User logged in',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip
    });
    
    const token = generateToken(user._id, user.role);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

export default router;
