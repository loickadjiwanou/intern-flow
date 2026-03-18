import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { internsAPI, usersAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save, User, GraduationCap, Briefcase, Calendar } from 'lucide-react';

const internSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  university: z.string().optional(),
  studyLevel: z.string().optional(),
  studyField: z.string().optional(),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  manager: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  duration: z.coerce.number().optional(),
  objectives: z.string().optional(),
  skillsToAcquire: z.string().optional(),
  status: z.string().default('Candidate'),
});

export default function InternForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(internSchema),
    defaultValues: {
      status: 'Candidate'
    }
  });

  const watchStatus = watch('status');
  const watchManager = watch('manager');

  useEffect(() => {
    fetchManagers();
    if (isEditing) {
      fetchIntern();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchManagers = async () => {
    try {
      const response = await usersAPI.getAll();
      const managerUsers = response.data.users?.filter(u => 
        ['Admin', 'HR', 'Manager'].includes(u.role)
      ) || [];
      setManagers(managerUsers);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
    }
  };

  const fetchIntern = async () => {
    try {
      const response = await internsAPI.getById(id);
      const intern = response.data.intern;
      
      // Reset form with intern data
      reset({
        firstName: intern.firstName || '',
        lastName: intern.lastName || '',
        email: intern.email || '',
        phone: intern.phone || '',
        university: intern.university || '',
        studyLevel: intern.studyLevel || '',
        studyField: intern.studyField || '',
        linkedin: intern.linkedin || '',
        portfolio: intern.portfolio || '',
        position: intern.position || '',
        department: intern.department || '',
        manager: intern.manager?._id || '',
        startDate: intern.startDate ? intern.startDate.split('T')[0] : '',
        endDate: intern.endDate ? intern.endDate.split('T')[0] : '',
        duration: intern.duration || '',
        objectives: intern.objectives || '',
        skillsToAcquire: intern.skillsToAcquire?.join(', ') || '',
        status: intern.status || 'Candidate',
      });
    } catch (error) {
      console.error('Failed to fetch intern:', error);
      toast.error(t('errorOccurred'));
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Process skillsToAcquire
      const processedData = {
        ...data,
        skillsToAcquire: data.skillsToAcquire 
          ? data.skillsToAcquire.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        manager: data.manager || undefined,
      };

      if (isEditing) {
        await internsAPI.update(id, processedData);
        toast.success('Stagiaire mis à jour avec succès');
      } else {
        await internsAPI.create(processedData);
        toast.success('Stagiaire créé avec succès');
      }
      
      navigate('/interns');
    } catch (error) {
      console.error('Failed to save intern:', error);
      toast.error(error.response?.data?.message || t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" data-testid="intern-form-page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/interns')}
          data-testid="back-button"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {isEditing ? 'Modifier le stagiaire' : 'Ajouter un stagiaire'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modifiez les informations du stagiaire' : 'Remplissez les informations du nouveau stagiaire'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <User size={20} className="text-brand-600" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground">{t('firstName')} *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                className={`bg-background border-input ${errors.firstName ? 'border-red-500' : ''}`}
                data-testid="input-firstName"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground">{t('lastName')} *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                className={`bg-background border-input ${errors.lastName ? 'border-red-500' : ''}`}
                data-testid="input-lastName"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">{t('email')} *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={`bg-background border-input ${errors.email ? 'border-red-500' : ''}`}
                data-testid="input-email"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Téléphone</Label>
              <Input
                id="phone"
                {...register('phone')}
                className="bg-background border-input"
                data-testid="input-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-foreground">LinkedIn</Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/..."
                {...register('linkedin')}
                className="bg-background border-input"
                data-testid="input-linkedin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio" className="text-foreground">Portfolio</Label>
              <Input
                id="portfolio"
                placeholder="https://..."
                {...register('portfolio')}
                className="bg-background border-input"
                data-testid="input-portfolio"
              />
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <GraduationCap size={20} className="text-brand-600" />
              Formation
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="university" className="text-foreground">Université / École</Label>
              <Input
                id="university"
                {...register('university')}
                className="bg-background border-input"
                data-testid="input-university"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studyLevel" className="text-foreground">Niveau d'études</Label>
              <Select
                value={watch('studyLevel') || ''}
                onValueChange={(value) => setValue('studyLevel', value)}
              >
                <SelectTrigger className="bg-background border-input" data-testid="select-studyLevel">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bac">Bac</SelectItem>
                  <SelectItem value="Bac+1">Bac+1</SelectItem>
                  <SelectItem value="Bac+2">Bac+2</SelectItem>
                  <SelectItem value="Bac+3">Bac+3 (Licence)</SelectItem>
                  <SelectItem value="Bac+4">Bac+4 (Master 1)</SelectItem>
                  <SelectItem value="Bac+5">Bac+5 (Master 2)</SelectItem>
                  <SelectItem value="Doctorat">Doctorat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="studyField" className="text-foreground">Domaine d'études</Label>
              <Input
                id="studyField"
                {...register('studyField')}
                placeholder="Ex: Informatique, Marketing, Finance..."
                className="bg-background border-input"
                data-testid="input-studyField"
              />
            </div>
          </CardContent>
        </Card>

        {/* Internship Info */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Briefcase size={20} className="text-brand-600" />
              Informations du stage
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position" className="text-foreground">Poste</Label>
              <Input
                id="position"
                {...register('position')}
                placeholder="Ex: Développeur Web"
                className="bg-background border-input"
                data-testid="input-position"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-foreground">Département</Label>
              <Select
                value={watch('department') || ''}
                onValueChange={(value) => setValue('department', value)}
              >
                <SelectTrigger className="bg-background border-input" data-testid="select-department">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">IT / Informatique</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="RH">Ressources Humaines</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Operations">Opérations</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager" className="text-foreground">Manager</Label>
              <Select
                value={watchManager || ''}
                onValueChange={(value) => setValue('manager', value)}
              >
                <SelectTrigger className="bg-background border-input" data-testid="select-manager">
                  <SelectValue placeholder="Sélectionner un manager..." />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager._id} value={manager._id}>
                      {manager.firstName} {manager.lastName} ({manager.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-foreground">Statut</Label>
              <Select
                value={watchStatus || 'Candidate'}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger className="bg-background border-input" data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Candidate">{t('candidate')}</SelectItem>
                  <SelectItem value="Interview">{t('interview')}</SelectItem>
                  <SelectItem value="Accepted">{t('accepted')}</SelectItem>
                  <SelectItem value="Active Intern">{t('activeIntern')}</SelectItem>
                  <SelectItem value="Internship Completed">{t('internshipCompleted')}</SelectItem>
                  <SelectItem value="Hired">{t('hired')}</SelectItem>
                  <SelectItem value="Rejected">{t('rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Calendar size={20} className="text-brand-600" />
              Dates du stage
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-foreground">Date de début</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
                className="bg-background border-input"
                data-testid="input-startDate"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-foreground">Date de fin</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
                className="bg-background border-input"
                data-testid="input-endDate"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-foreground">Durée (mois)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                {...register('duration')}
                className="bg-background border-input"
                data-testid="input-duration"
              />
            </div>
          </CardContent>
        </Card>

        {/* Objectives */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              Objectifs et compétences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="objectives" className="text-foreground">Objectifs du stage</Label>
              <Textarea
                id="objectives"
                {...register('objectives')}
                rows={3}
                placeholder="Décrivez les objectifs principaux du stage..."
                className="bg-background border-input resize-none"
                data-testid="input-objectives"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillsToAcquire" className="text-foreground">
                Compétences à acquérir
              </Label>
              <Input
                id="skillsToAcquire"
                {...register('skillsToAcquire')}
                placeholder="Séparez les compétences par des virgules"
                className="bg-background border-input"
                data-testid="input-skillsToAcquire"
              />
              <p className="text-xs text-muted-foreground">
                Ex: React, Node.js, MongoDB, Communication
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/interns')}
            data-testid="cancel-button"
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700"
            data-testid="submit-button"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save size={18} className="mr-2" />
            )}
            {isEditing ? t('save') : 'Créer le stagiaire'}
          </Button>
        </div>
      </form>
    </div>
  );
}
