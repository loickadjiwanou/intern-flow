import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intern',
    required: true
  },
  type: {
    type: String,
    enum: ['CV', 'Convention', 'Contract', 'Final Report', 'Certificate', 'Other'],
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: Number,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);
export default Document;
