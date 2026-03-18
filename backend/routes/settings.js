import express from 'express';
import Settings from '../models/Settings.js';
import EmailTemplate from '../models/EmailTemplate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Default professional email templates FR/EN
const defaultTemplates = {
  fr: [
    {
      name: 'Bienvenue Stagiaire',
      type: 'welcome',
      subject: 'Bienvenue chez {company_name} - Début de votre stage',
      body: `Bonjour {intern_name},

Nous sommes ravis de vous accueillir au sein de notre équipe pour votre stage dans le département {department}.

Votre stage débutera le {start_date} et se terminera le {end_date}.

Votre superviseur sera {supervisor_name} qui vous contactera prochainement pour organiser votre première journée.

Documents à préparer:
- Pièce d'identité
- RIB pour le remboursement des frais
- Convention de stage signée

En cas de questions, n'hésitez pas à contacter notre équipe RH.

Cordialement,
L'équipe {company_name}`,
      language: 'fr',
      isActive: true,
      isDefault: true,
    },
    {
      name: 'Rappel Évaluation',
      type: 'evaluation_reminder',
      subject: 'Rappel: Évaluation de {intern_name} à planifier',
      body: `Bonjour {supervisor_name},

Ceci est un rappel pour planifier l'évaluation de {intern_name}.

Type d'évaluation: {evaluation_type}
Date limite: {deadline}

Merci de compléter l'évaluation dans les meilleurs délais via la plateforme InternFlow.

Cordialement,
L'équipe RH`,
      language: 'fr',
      isActive: true,
      isDefault: true,
    },
    {
      name: 'Fin de Stage',
      type: 'internship_end',
      subject: 'Fin de stage - {intern_name}',
      body: `Bonjour {intern_name},

Votre stage au sein de {company_name} touche à sa fin le {end_date}.

Avant votre départ, merci de:
- Remettre tout le matériel prêté
- Compléter le rapport final de stage
- Participer à l'entretien de fin de stage

Nous vous souhaitons une excellente continuation dans votre parcours professionnel.

Cordialement,
L'équipe {company_name}`,
      language: 'fr',
      isActive: true,
      isDefault: true,
    },
    {
      name: 'Nouvelle Tâche Assignée',
      type: 'task_assigned',
      subject: 'Nouvelle tâche assignée: {task_title}',
      body: `Bonjour {intern_name},

Une nouvelle tâche vous a été assignée.

Titre: {task_title}
Description: {task_description}
Priorité: {task_priority}
Date limite: {deadline}

Connectez-vous à InternFlow pour voir les détails et commencer.

Cordialement,
{supervisor_name}`,
      language: 'fr',
      isActive: true,
      isDefault: true,
    },
  ],
  en: [
    {
      name: 'Welcome Intern',
      type: 'welcome',
      subject: 'Welcome to {company_name} - Start of your internship',
      body: `Dear {intern_name},

We are delighted to welcome you to our team for your internship in the {department} department.

Your internship will start on {start_date} and end on {end_date}.

Your supervisor will be {supervisor_name} who will contact you shortly to organize your first day.

Documents to prepare:
- ID document
- Bank details for expense reimbursement
- Signed internship agreement

If you have any questions, please do not hesitate to contact our HR team.

Best regards,
The {company_name} Team`,
      language: 'en',
      isActive: true,
      isDefault: true,
    },
    {
      name: 'Evaluation Reminder',
      type: 'evaluation_reminder',
      subject: 'Reminder: Schedule evaluation for {intern_name}',
      body: `Dear {supervisor_name},

This is a reminder to schedule the evaluation for {intern_name}.

Evaluation type: {evaluation_type}
Deadline: {deadline}

Please complete the evaluation as soon as possible through the InternFlow platform.

Best regards,
HR Team`,
      language: 'en',
      isActive: true,
      isDefault: true,
    },
    {
      name: 'Internship End',
      type: 'internship_end',
      subject: 'End of Internship - {intern_name}',
      body: `Dear {intern_name},

Your internship at {company_name} is coming to an end on {end_date}.

Before your departure, please:
- Return all borrowed equipment
- Complete the final internship report
- Attend the exit interview

We wish you all the best in your professional journey.

Best regards,
The {company_name} Team`,
      language: 'en',
      isActive: true,
      isDefault: true,
    },
    {
      name: 'New Task Assigned',
      type: 'task_assigned',
      subject: 'New task assigned: {task_title}',
      body: `Dear {intern_name},

A new task has been assigned to you.

Title: {task_title}
Description: {task_description}
Priority: {task_priority}
Deadline: {deadline}

Log in to InternFlow to view details and get started.

Best regards,
{supervisor_name}`,
      language: 'en',
      isActive: true,
      isDefault: true,
    },
  ],
};

router.get('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    
    const settingsObj = settings.toObject();
    if (settingsObj.smtpPassword) {
      settingsObj.smtpPassword = '********';
    }
    
    res.json({ settings: settingsObj });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings', error: error.message });
  }
});

router.put('/smtp', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPassword, senderEmail, senderName, emailLanguage } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    settings.smtpHost = smtpHost;
    settings.smtpPort = smtpPort;
    settings.smtpUser = smtpUser;
    if (smtpPassword && smtpPassword !== '********') {
      settings.smtpPassword = smtpPassword;
    }
    settings.senderEmail = senderEmail;
    settings.senderName = senderName;
    settings.emailLanguage = emailLanguage || 'en';
    settings.isSmtpConfigured = !!(smtpHost && smtpPort && smtpUser);
    
    await settings.save();
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Updated SMTP settings',
      resourceType: 'Settings',
      ipAddress: req.ip
    });
    
    res.json({ message: 'SMTP settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update SMTP settings', error: error.message });
  }
});

// Test SMTP connection and send test email
router.post('/test-email', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    
    const settings = await Settings.findOne();
    if (!settings || !settings.isSmtpConfigured) {
      return res.status(400).json({ message: 'SMTP not configured. Please configure SMTP settings first.' });
    }
    
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: parseInt(settings.smtpPort),
      secure: parseInt(settings.smtpPort) === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });
    
    // Verify connection first
    await transporter.verify();
    
    const lang = settings.emailLanguage || 'en';
    const subject = lang === 'fr' 
      ? 'Test Email - InternFlow CRM ✅' 
      : 'Test Email - InternFlow CRM ✅';
    
    const htmlContent = lang === 'fr' 
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0066CC 0%, #004C99 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">✅ Test Réussi!</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Configuration SMTP validée</h2>
            <p style="color: #666; line-height: 1.6;">
              Félicitations! Votre configuration SMTP fonctionne correctement.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Serveur:</strong> ${settings.smtpHost}</p>
              <p style="margin: 5px 0;"><strong>Port:</strong> ${settings.smtpPort}</p>
              <p style="margin: 5px 0;"><strong>Expéditeur:</strong> ${settings.senderName} &lt;${settings.senderEmail}&gt;</p>
            </div>
            <p style="color: #999; font-size: 12px;">
              Cet email a été envoyé depuis InternFlow CRM.
            </p>
          </div>
        </div>`
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0066CC 0%, #004C99 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">✅ Test Successful!</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">SMTP Configuration Validated</h2>
            <p style="color: #666; line-height: 1.6;">
              Congratulations! Your SMTP configuration is working correctly.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Server:</strong> ${settings.smtpHost}</p>
              <p style="margin: 5px 0;"><strong>Port:</strong> ${settings.smtpPort}</p>
              <p style="margin: 5px 0;"><strong>Sender:</strong> ${settings.senderName} &lt;${settings.senderEmail}&gt;</p>
            </div>
            <p style="color: #999; font-size: 12px;">
              This email was sent from InternFlow CRM.
            </p>
          </div>
        </div>`;
    
    await transporter.sendMail({
      from: `"${settings.senderName}" <${settings.senderEmail}>`,
      to: recipientEmail,
      subject,
      html: htmlContent
    });
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Sent test email',
      resourceType: 'Settings',
      ipAddress: req.ip
    });
    
    res.json({ message: 'Test email sent successfully', success: true });
  } catch (error) {
    console.error('SMTP Test Error:', error);
    res.status(500).json({ 
      message: 'Failed to send test email', 
      error: error.message,
      details: error.code || 'Check your SMTP credentials and server settings',
      success: false
    });
  }
});

// Get templates
router.get('/templates', authenticate, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({ language: 1, type: 1 });
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch templates', error: error.message });
  }
});

// Initialize default templates
router.post('/templates/init-defaults', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const language = settings?.emailLanguage || 'en';
    
    // Check if templates already exist
    const existingCount = await EmailTemplate.countDocuments({ isDefault: true });
    
    if (existingCount > 0) {
      return res.status(400).json({ message: 'Default templates already initialized' });
    }
    
    // Insert templates for both languages
    const allTemplates = [...defaultTemplates.fr, ...defaultTemplates.en];
    await EmailTemplate.insertMany(allTemplates);
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Initialized default email templates',
      resourceType: 'EmailTemplate',
      ipAddress: req.ip
    });
    
    res.json({ message: 'Default templates initialized successfully', count: allTemplates.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to initialize templates', error: error.message });
  }
});

router.post('/templates', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const template = new EmailTemplate({ ...req.body, isDefault: false });
    await template.save();
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Created email template',
      resourceType: 'EmailTemplate',
      resourceId: template._id.toString(),
      ipAddress: req.ip
    });
    
    res.status(201).json({ message: 'Template created successfully', template });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create template', error: error.message });
  }
});

router.put('/templates/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Updated email template',
      resourceType: 'EmailTemplate',
      resourceId: template._id.toString(),
      ipAddress: req.ip
    });
    
    res.json({ message: 'Template updated successfully', template });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update template', error: error.message });
  }
});

router.put('/automation', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { automationRules } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    settings.automationRules = automationRules;
    await settings.save();
    
    await AuditLog.create({
      user: req.user._id,
      action: 'Updated automation rules',
      resourceType: 'Settings',
      ipAddress: req.ip
    });
    
    res.json({ message: 'Automation rules updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update automation rules', error: error.message });
  }
});

export default router;
