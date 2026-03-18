import nodemailer from 'nodemailer';
import Settings from '../models/Settings.js';

export const sendEmail = async (to, subject, html) => {
  try {
    const settings = await Settings.findOne();
    
    if (!settings || !settings.isSmtpConfigured) {
      console.log('SMTP not configured. Email not sent.');
      return { success: false, message: 'SMTP not configured' };
    }
    
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword
      }
    });
    
    await transporter.sendMail({
      from: `"${settings.senderName}" <${settings.senderEmail}>`,
      to,
      subject,
      html
    });
    
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: error.message };
  }
};

export const renderTemplate = (template, variables) => {
  let rendered = template;
  
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    rendered = rendered.replace(regex, variables[key]);
  });
  
  return rendered;
};
