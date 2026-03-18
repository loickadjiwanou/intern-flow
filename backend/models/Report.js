import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intern',
    required: true
  },
  type: {
    type: String,
    enum: ['Daily', 'Weekly'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  tasksCompleted: String,
  problemsEncountered: String,
  learnings: String,
  weekSummary: String,
  progress: String,
  blockers: String,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Revision Requested'],
    default: 'Pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewComment: String,
  reviewedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
export default Report;
