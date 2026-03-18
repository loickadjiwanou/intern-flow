import React, { useState, useEffect } from 'react';
import { settingsAPI, usersAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, TestTube, Mail, Users as UsersIcon, Settings as SettingsIcon, Zap } from 'lucide-react';

export default function Settings() {
  const { t } = useLanguage();
  const [smtpData, setSmtpData] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    senderEmail: '',
    senderName: '',
    emailLanguage: 'fr',
  });
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [rules, setRules] = useState([]);
  const [openTemplate, setOpenTemplate] = useState(false);
  const [openRule, setOpenRule] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
    language: 'fr',
  });
  const [ruleForm, setRuleForm] = useState({
    name: '',
    trigger: '',
    action: '',
    isActive: true,
  });

  useEffect(() => {
    fetchSettings();
    fetchUsers();
    fetchTemplates();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      if (response.data.settings) {
        setSmtpData({
          smtpHost: response.data.settings.smtpHost || '',
          smtpPort: response.data.settings.smtpPort || '',
          smtpUser: response.data.settings.smtpUser || '',
          smtpPassword: '',
          senderEmail: response.data.settings.senderEmail || '',
          senderName: response.data.settings.senderName || '',
          emailLanguage: response.data.settings.emailLanguage || 'fr',
        });
        setRules(response.data.settings.automationRules || []);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await settingsAPI.getTemplates();
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleSaveSMTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsAPI.updateSMTP(smtpData);
      toast.success(t('save') + ' ' + t('success'));
    } catch (error) {
      toast.error(t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error(t('requiredField'));
      return;
    }
    setLoading(true);
    try {
      await settingsAPI.testEmail({ recipientEmail: testEmail });
      toast.success('Email de test envoyé');
      setTestEmail('');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du test');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await usersAPI.update(userId, { role: newRole });
      toast.success('Rôle mis à jour');
      fetchUsers();
    } catch (error) {
      toast.error(t('errorOccurred'));
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      await settingsAPI.createTemplate(templateForm);
      toast.success('Template créé');
      setOpenTemplate(false);
      setTemplateForm({ name: '', subject: '', body: '', language: 'fr' });
      fetchTemplates();
    } catch (error) {
      toast.error(t('errorOccurred'));
    }
  };

  const handleSaveAutomation = async () => {
    try {
      await settingsAPI.updateAutomation({ automationRules: rules });
      toast.success('Règles enregistrées');
    } catch (error) {
      toast.error(t('errorOccurred'));
    }
  };

  const addRule = () => {
    if (!ruleForm.name || !ruleForm.trigger || !ruleForm.action) {
      toast.error(t('requiredField'));
      return;
    }
    setRules([...rules, { ...ruleForm, id: Date.now() }]);
    setRuleForm({ name: '', trigger: '', action: '', isActive: true });
    setOpenRule(false);
  };

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div>
        <h1 className="text-4xl font-heading font-bold mb-2">{t('settings')}</h1>
        <p className="text-muted-foreground">{t('appConfiguration')}</p>
      </div>

      <Tabs defaultValue="smtp" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="smtp" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white">
            <Mail size={16} className="mr-2" />
            {t('smtpConfiguration')}
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white">
            <SettingsIcon size={16} className="mr-2" />
            {t('emailTemplates')}
          </TabsTrigger>
          <TabsTrigger value="automation" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white">
            <Zap size={16} className="mr-2" />
            {t('automation')}
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white">
            <UsersIcon size={16} className="mr-2" />
            {t('userManagement')}
          </TabsTrigger>
        </TabsList>

        {/* SMTP Configuration */}
        <TabsContent value="smtp" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('smtpConfiguration')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSMTP} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('smtpHost')}</Label>
                    <Input
                      value={smtpData.smtpHost}
                      onChange={(e) => setSmtpData({ ...smtpData, smtpHost: e.target.value })}
                      placeholder="smtp.gmail.com"
                      data-testid="smtp-host-input"
                    />
                  </div>
                  <div>
                    <Label>{t('smtpPort')}</Label>
                    <Input
                      value={smtpData.smtpPort}
                      onChange={(e) => setSmtpData({ ...smtpData, smtpPort: e.target.value })}
                      placeholder="587"
                      data-testid="smtp-port-input"
                    />
                  </div>
                </div>
                <div>
                  <Label>{t('smtpUser')}</Label>
                  <Input
                    value={smtpData.smtpUser}
                    onChange={(e) => setSmtpData({ ...smtpData, smtpUser: e.target.value })}
                    data-testid="smtp-user-input"
                  />
                </div>
                <div>
                  <Label>{t('smtpPassword')}</Label>
                  <Input
                    type="password"
                    value={smtpData.smtpPassword}
                    onChange={(e) => setSmtpData({ ...smtpData, smtpPassword: e.target.value })}
                    placeholder="Laisser vide pour conserver"
                    data-testid="smtp-password-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('senderEmail')}</Label>
                    <Input
                      type="email"
                      value={smtpData.senderEmail}
                      onChange={(e) => setSmtpData({ ...smtpData, senderEmail: e.target.value })}
                      data-testid="sender-email-input"
                    />
                  </div>
                  <div>
                    <Label>{t('senderName')}</Label>
                    <Input
                      value={smtpData.senderName}
                      onChange={(e) => setSmtpData({ ...smtpData, senderName: e.target.value })}
                      data-testid="sender-name-input"
                    />
                  </div>
                </div>
                <div>
                  <Label>{t('emailLanguage')}</Label>
                  <Select value={smtpData.emailLanguage} onValueChange={(value) => setSmtpData({ ...smtpData, emailLanguage: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Langue utilisée pour les emails automatiques</p>
                </div>
                
                {/* Test Email Section */}
                <div className="border-t pt-4 mt-4">
                  <Label>{t('testEmail')}</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestEmail}
                      disabled={loading}
                    >
                      <TestTube size={16} className="mr-2" />
                      {t('sendTest')}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} data-testid="save-smtp-button" className="flex-1">
                    {loading ? t('loading') : t('save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="templates" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{t('emailTemplates')}</h3>
            <Dialog open={openTemplate} onOpenChange={setOpenTemplate}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-brand-600">
                  <Plus size={16} className="mr-2" />
                  {t('createTemplate')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('createTemplate')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTemplate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('templateName')}</Label>
                      <Input
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Langue</Label>
                      <Select value={templateForm.language} onValueChange={(value) => setTemplateForm({ ...templateForm, language: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">🇫🇷 Français</SelectItem>
                          <SelectItem value="en">🇬🇧 English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>{t('subject')}</Label>
                    <Input
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>{t('body')}</Label>
                    <Textarea
                      value={templateForm.body}
                      onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                      rows={8}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Variables: {'{intern_name}, {start_date}, {end_date}, {department}'}
                    </p>
                  </div>
                  <Button type="submit" className="w-full">{t('createTemplate')}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template._id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{template.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {template.language === 'fr' ? '🇫🇷' : '🇬🇧'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{template.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{template.body}</p>
                    </div>
                    <Badge className={template.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-slate-100 text-slate-700'}>
                      {template.isActive ? t('active') : t('inactive')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {templates.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Aucun template d'email configuré
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Automation Rules */}
        <TabsContent value="automation" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{t('automationRules')}</h3>
            <div className="flex gap-2">
              <Dialog open={openRule} onOpenChange={setOpenRule}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus size={16} className="mr-2" />
                    {t('addRule')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('addRule')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>{t('ruleName')}</Label>
                      <Input
                        value={ruleForm.name}
                        onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>{t('trigger')}</Label>
                      <Input
                        value={ruleForm.trigger}
                        onChange={(e) => setRuleForm({ ...ruleForm, trigger: e.target.value })}
                        placeholder="Ex: Stage fin - 7 jours"
                      />
                    </div>
                    <div>
                      <Label>{t('action')}</Label>
                      <Input
                        value={ruleForm.action}
                        onChange={(e) => setRuleForm({ ...ruleForm, action: e.target.value })}
                        placeholder="Ex: Envoyer email au manager"
                      />
                    </div>
                    <Button onClick={addRule} className="w-full">{t('addRule')}</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button size="sm" onClick={handleSaveAutomation} className="bg-brand-600">
                {t('save')}
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <Card key={rule.id || index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Si:</span> {rule.trigger}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Alors:</span> {rule.action}
                      </p>
                    </div>
                    <Badge className={rule.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                      {rule.isActive ? t('active') : t('inactive')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {rules.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Aucune règle d'automatisation configurée
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('userManagement')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Select value={user.role} onValueChange={(value) => handleChangeRole(user._id, value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">{t('admin')}</SelectItem>
                        <SelectItem value="HR">{t('hr')}</SelectItem>
                        <SelectItem value="Manager">{t('manager')}</SelectItem>
                        <SelectItem value="Intern">{t('intern')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
