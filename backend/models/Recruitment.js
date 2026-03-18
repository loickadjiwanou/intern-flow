import mongoose from 'mongoose';

const recruitmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  department: String,
  description: String,
  requirements: [String],
  location: String,
  duration: String,
  startDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const applicationSchema = new mongoose.Schema({
  recruitment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruitment',
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  cvUrl: String,
  coverLetter: String,
  status: {
    type: String,
    enum: ['Applied', 'Screening', 'Interview', 'Technical Test', 'Accepted', 'Rejected'],
    default: 'Applied'
  },
  notes: String,
  interviewDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Recruitment = mongoose.model('Recruitment', recruitmentSchema);
const Application = mongoose.model('Application', applicationSchema);

export { Recruitment, Application };
