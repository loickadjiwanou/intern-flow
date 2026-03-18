import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { internsAPI, tasksAPI, documentsAPI, evaluationsAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  User,
  Briefcase,
  FileText,
  CheckSquare,
  Star,
  Edit,
  Trash2,
  Download,
  ExternalLink,
  Linkedin
} from 'lucide-react';

const statusColors = {
  'Candidate': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  'Interview': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  'Accepted': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  'Active Intern': 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  'Internship Completed': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
  'Hired': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
  'Rejected': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
};

const priorityColors = {
  'Low': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
  'High': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
  'Urgent': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
};

const taskStatusColors = {
  'To Do': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  'Review': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
  'Done': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
};

export default function InternDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [intern, setIntern] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchInternData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchInternData = async () => {
    try {
      setLoading(true);
      const [internRes, tasksRes, docsRes, evalsRes] = await Promise.all([
        internsAPI.getById(id),
        tasksAPI.getAll({ intern: id }),
        documentsAPI.getAll({ intern: id }),
        evaluationsAPI.getAll({ intern: id })
      ]);
      
      setIntern(internRes.data.intern);
      setTasks(tasksRes.data.tasks || []);
      setDocuments(docsRes.data.documents || []);
      setEvaluations(evalsRes.data.evaluations || []);
    } catch (error) {
      console.error('Failed to fetch intern data:', error);
      toast.error(t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce stagiaire ?')) {
      try {
        await internsAPI.delete(id);
        toast.success('Stagiaire supprimé');
        navigate('/interns');
      } catch (error) {
        toast.error(t('errorOccurred'));
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="intern-detail-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4" data-testid="intern-not-found">
        <p className="text-lg text-muted-foreground">Stagiaire non trouvé</p>
        <Button onClick={() => navigate('/interns')} variant="outline">
          <ArrowLeft size={18} className="mr-2" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="intern-detail-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/interns')}
            data-testid="back-button"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-300 font-bold text-2xl">
              {intern.firstName?.[0]}{intern.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                {intern.firstName} {intern.lastName}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge className={`${statusColors[intern.status]} border-0`}>
                  {intern.status}
                </Badge>
                {intern.position && (
                  <span className="text-sm text-muted-foreground">{intern.position}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/interns/${id}/edit`)}
            data-testid="edit-intern-button"
          >
            <Edit size={18} className="mr-2" />
            {t('edit')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            data-testid="delete-intern-button"
          >
            <Trash2 size={18} className="mr-2" />
            {t('delete')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 dark:bg-muted">
          <TabsTrigger value="overview" data-testid="tab-overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="tasks" data-testid="tab-tasks">
            Tâches ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-documents">
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="evaluations" data-testid="tab-evaluations">
            Évaluations ({evaluations.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Info */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <User size={20} className="text-brand-600" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href={`mailto:${intern.email}`} className="text-foreground hover:text-brand-600">
                      {intern.email}
                    </a>
                  </div>
                </div>
                {intern.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="text-foreground">{intern.phone}</p>
                    </div>
                  </div>
                )}
                {intern.linkedin && (
                  <div className="flex items-center gap-3">
                    <Linkedin size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">LinkedIn</p>
                      <a href={intern.linkedin} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline flex items-center gap-1">
                        Voir le profil <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <GraduationCap size={20} className="text-brand-600" />
                  Formation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {intern.university && (
                  <div>
                    <p className="text-sm text-muted-foreground">Université / École</p>
                    <p className="text-foreground font-medium">{intern.university}</p>
                  </div>
                )}
                {intern.studyLevel && (
                  <div>
                    <p className="text-sm text-muted-foreground">Niveau d'études</p>
                    <p className="text-foreground">{intern.studyLevel}</p>
                  </div>
                )}
                {intern.studyField && (
                  <div>
                    <p className="text-sm text-muted-foreground">Domaine d'études</p>
                    <p className="text-foreground">{intern.studyField}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Internship Info */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <Briefcase size={20} className="text-brand-600" />
                  Stage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {intern.department && (
                  <div className="flex items-center gap-3">
                    <Building size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Département</p>
                      <p className="text-foreground">{intern.department}</p>
                    </div>
                  </div>
                )}
                {intern.position && (
                  <div>
                    <p className="text-sm text-muted-foreground">Poste</p>
                    <p className="text-foreground">{intern.position}</p>
                  </div>
                )}
                {intern.manager && (
                  <div>
                    <p className="text-sm text-muted-foreground">Manager</p>
                    <p className="text-foreground">
                      {intern.manager.firstName} {intern.manager.lastName}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dates */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <Calendar size={20} className="text-brand-600" />
                  Dates du stage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date de début</p>
                    <p className="text-foreground font-medium">{formatDate(intern.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de fin</p>
                    <p className="text-foreground font-medium">{formatDate(intern.endDate)}</p>
                  </div>
                </div>
                {intern.duration && (
                  <div>
                    <p className="text-sm text-muted-foreground">Durée</p>
                    <p className="text-foreground">{intern.duration} mois</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Objectives & Skills */}
          {(intern.objectives || (intern.skillsToAcquire && intern.skillsToAcquire.length > 0)) && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-foreground">Objectifs et compétences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {intern.objectives && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Objectifs du stage</p>
                    <p className="text-foreground">{intern.objectives}</p>
                  </div>
                )}
                {intern.skillsToAcquire && intern.skillsToAcquire.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Compétences à acquérir</p>
                    <div className="flex flex-wrap gap-2">
                      {intern.skillsToAcquire.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          {tasks.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <CheckSquare size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune tâche assignée</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card key={task._id} className="border-border bg-card hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium text-foreground">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`${taskStatusColors[task.status]} border-0 text-xs`}>
                            {task.status}
                          </Badge>
                          <Badge className={`${priorityColors[task.priority]} border-0 text-xs`}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      {task.deadline && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(task.deadline)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          {documents.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun document</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <Card key={doc._id} className="border-border bg-card hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                        <FileText size={20} className="text-brand-600 dark:text-brand-300" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{doc.fileName}</p>
                        <p className="text-sm text-muted-foreground">{doc.type}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download size={18} className="text-muted-foreground" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Evaluations Tab */}
        <TabsContent value="evaluations" className="space-y-4">
          {evaluations.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <Star size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune évaluation</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {evaluations.map((evaluation) => (
                <Card key={evaluation._id} className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge variant="outline" className="mb-2">{evaluation.type}</Badge>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(evaluation.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Note globale</p>
                        <p className="text-2xl font-bold text-brand-600">{evaluation.overallScore}/5</p>
                      </div>
                    </div>
                    {evaluation.feedback && (
                      <p className="text-sm text-foreground mt-2">{evaluation.feedback}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
