import express from 'express';
import Document from '../models/Document.js';
import { authenticate, authorize } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.get('/', authenticate, async (req, res) => {
  try {
    const { intern, type } = req.query;
    
    const query = {};
    if (intern) query.intern = intern;
    if (type) query.type = type;
    
    const documents = await Document.find(query)
      .populate('intern', 'firstName lastName')
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
  }
});

router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const documentData = {
      intern: req.body.intern,
      type: req.body.type,
      filename: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      uploadedBy: req.user._id
    };
    
    const document = new Document(documentData);
    await document.save();
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Uploaded document',
      resourceType: 'Document',
      resourceId: document._id.toString(),
      ipAddress: req.ip
    });
    
    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload document', error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Deleted document',
      resourceType: 'Document',
      resourceId: document._id.toString(),
      ipAddress: req.ip
    });
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete document', error: error.message });
  }
});

export default router;
