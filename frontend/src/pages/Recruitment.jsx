import React, { useState, useEffect } from 'react';
import { recruitmentAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Briefcase, Mail, Phone, Calendar, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const statusColumns = [
  { id: 'Applied', title: 'applied', color: 'bg-slate-50 dark:bg-slate-900', badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { id: 'Screening', title: 'screening', color: 'bg-blue-50 dark:bg-blue-950', badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  { id: 'Interview', title: 'interview', color: 'bg-purple-50 dark:bg-purple-950', badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  { id: 'Technical Test', title: 'technicalTest', color: 'bg-amber-50 dark:bg-amber-950', badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  { id: 'Accepted', title: 'accepted', color: 'bg-green-50 dark:bg-green-950', badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  { id: 'Rejected', title: 'rejected', color: 'bg-red-50 dark:bg-red-950', badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
];

export default function Recruitment() {
  const { t } = useLanguage();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openJob, setOpenJob] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    department: '',
    description: '',
    location: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appsRes, jobsRes] = await Promise.all([
        recruitmentAPI.getApplications(),
        recruitmentAPI.getJobs(),
      ]);
      setApplications(appsRes.data.applications);
      setJobs(jobsRes.data.jobs);
    } catch (error) {
      console.error('Failed to fetch recruitment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await recruitmentAPI.createJob(jobForm);
      toast.success('Offre créée avec succès');
      setOpenJob(false);
      setJobForm({ title: '', department: '', description: '', location: '' });
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await recruitmentAPI.updateApplication(appId, { status: newStatus });
      toast.success('Statut mis à jour');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getApplicationsByStatus = (status) => applications.filter(app => app.status === status);

  return (
    <div className="space-y-6" data-testid="recruitment-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">{t('recruitment')}</h1>
          <p className="text-muted-foreground">{t('recruitmentPipeline')}</p>
        </div>
        <Dialog open={openJob} onOpenChange={setOpenJob}>
          <DialogTrigger asChild>
            <Button className="bg-brand-600 hover:bg-brand-700" data-testid="add-job-button">
              <Plus size={18} className="mr-2" />
              {t('newJobOffer')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('newJobOffer')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <Label>{t('jobTitle')}</Label>
                <Input
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>{t('department')}</Label>
                <Input
                  value={jobForm.department}
                  onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('location')}</Label>
                <Input
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('description')}</Label>
                <Textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">{t('add')}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Jobs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <Card key={job._id} className="hover:shadow-lg transition-shadow border-l-4 border-l-brand-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{job.department}</p>
                </div>
                <Briefcase className="text-brand-500" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{job.location}</span>
                <span>•</span>
                <Badge variant="secondary">
                  {applications.filter(app => app.recruitment === job._id).length} candidatures
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4" data-testid="recruitment-pipeline">
          {statusColumns.map((column) => {
            const columnApps = getApplicationsByStatus(column.id);
            return (
              <div key={column.id} className="min-w-[320px] w-[320px] flex flex-col" data-testid={`pipeline-column-${column.id}`}>
                <div className={`${column.color} rounded-t-xl p-4 border border-border`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t(column.title)}</h3>
                    <Badge className={`${column.badgeColor} border-0`}>{columnApps.length}</Badge>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-b-xl p-3 border-x border-b border-border space-y-3 flex-1 min-h-[400px]">
                  {columnApps.map((app) => (
                    <Card key={app._id} className="cursor-pointer hover:shadow-md transition-all group" data-testid={`application-card-${app._id}`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold group-hover:text-brand-600 transition-colors">
                                {app.firstName} {app.lastName}
                              </h4>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Mail size={12} />
                                <span className="truncate">{app.email}</span>
                              </div>
                            </div>
                          </div>
                          
                          {app.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone size={12} />
                              <span>{app.phone}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar size={12} />
                            <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-2 pt-2 border-t">
                            {column.id !== 'Accepted' && column.id !== 'Rejected' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-7 text-xs"
                                  onClick={() => {
                                    const currentIndex = statusColumns.findIndex(c => c.id === column.id);
                                    if (currentIndex < statusColumns.length - 2) {
                                      handleStatusChange(app._id, statusColumns[currentIndex + 1].id);
                                    }
                                  }}
                                >
                                  <ChevronRight size={12} className="mr-1" />
                                  {t('next')}
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
