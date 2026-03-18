import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const statusColors = {
  'Pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
  'Approved': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  'Revision Requested': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportsAPI.getAll();
      setReports(response.data.reports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="reports-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Rapports</h1>
          <p className="text-muted-foreground">Rapports d'activité des stagiaires</p>
        </div>
        <Button className="bg-brand-600 hover:bg-brand-700" data-testid="add-report-button">
          <Plus size={18} className="mr-2" />
          Nouveau rapport
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : reports.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucun rapport disponible</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report._id} className="hover:shadow-md transition-shadow bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {report.intern?.firstName} {report.intern?.lastName}
                      </h3>
                      <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                        {report.type}
                      </Badge>
                      <Badge className={`${statusColors[report.status]} border-0 text-xs`}>
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{report.tasksCompleted}</p>
                    <p className="text-xs text-muted-foreground">{new Date(report.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
