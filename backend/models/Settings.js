import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  smtpHost: String,
  smtpPort: Number,
  smtpUser: String,
  smtpPassword: String,
  senderEmail: String,
  senderName: String,
  isSmtpConfigured: {
    type: Boolean,
    default: false
  },
  automationRules: [{
    name: String,
    trigger: String,
    action: String,
    isActive: Boolean
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
