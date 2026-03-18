import mongoose from 'mongoose';

const internSchema = new mongoose.Schema({
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
    required: true,
    unique: true
  },
  phone: String,
  photo: String,
  cvUrl: String,
  university: String,
  studyLevel: String,
  studyField: String,
  portfolio: String,
  linkedin: String,
  position: String,
  department: String,
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  startDate: Date,
  endDate: Date,
  duration: Number,
  objectives: String,
  skillsToAcquire: [String],
  status: {
    type: String,
    enum: ['Candidate', 'Interview', 'Accepted', 'Active Intern', 'Internship Completed', 'Hired', 'Rejected'],
    default: 'Candidate'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

const Intern = mongoose.model('Intern', internSchema);
export default Intern;
