import React, { useState, useEffect } from 'react';
import { internsAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusColors = {
  'Candidate': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'Interview': 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  'Accepted': 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  'Active Intern': 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-400',
  'Internship Completed': 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  'Hired': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  'Rejected': 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
};

export default function Interns() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInterns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchInterns = async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await internsAPI.getAll(params);
      setInterns(response.data.interns);
    } catch (error) {
      console.error('Failed to fetch interns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterns = interns.filter(intern =>
    `${intern.firstName} ${intern.lastName} ${intern.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="interns-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Stagiaires</h1>
          <p className="text-muted-foreground">Gérez tous vos stagiaires</p>
        </div>
        <Button
          onClick={() => navigate('/interns/new')}
          className="bg-brand-600 hover:bg-brand-700"
          data-testid="add-intern-button"
        >
          <Plus size={18} className="mr-2" />
          Ajouter un stagiaire
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder={t('searchIntern')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background"
            data-testid="search-interns-input"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="status-filter-select">
            <Filter size={18} className="mr-2" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatus')}</SelectItem>
            <SelectItem value="Candidate">{t('candidate')}</SelectItem>
            <SelectItem value="Interview">{t('interview')}</SelectItem>
            <SelectItem value="Accepted">{t('accepted')}</SelectItem>
            <SelectItem value="Active Intern">{t('activeIntern')}</SelectItem>
            <SelectItem value="Internship Completed">{t('internshipCompleted')}</SelectItem>
            <SelectItem value="Hired">{t('hired')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredInterns.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucun stagiaire trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInterns.map((intern) => (
            <Card
              key={intern._id}
              className="hover:shadow-lg transition-shadow cursor-pointer bg-card"
              onClick={() => navigate(`/interns/${intern._id}`)}
              data-testid={`intern-card-${intern._id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-lg">
                    {intern.firstName?.[0]}{intern.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 truncate">
                      {intern.firstName} {intern.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 truncate">{intern.email}</p>
                    <Badge className={`${statusColors[intern.status]} border-0`}>
                      {intern.status}
                    </Badge>
                  </div>
                </div>
                {intern.position && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">{intern.position}</p>
                    {intern.department && (
                      <p className="text-xs text-muted-foreground mt-1">{intern.department}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
