import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intern',
    required: true
  },
  evaluator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Weekly', 'Monthly', 'Final'],
    required: true
  },
  period: String,
  criteria: {
    technicalSkills: {
      score: Number,
      comment: String
    },
    communication: {
      score: Number,
      comment: String
    },
    autonomy: {
      score: Number,
      comment: String
    },
    teamwork: {
      score: Number,
      comment: String
    },
    deadlineRespect: {
      score: Number,
      comment: String
    }
  },
  overallScore: Number,
  generalComment: String,
  feedback: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Evaluation = mongoose.model('Evaluation', evaluationSchema);
export default Evaluation;
