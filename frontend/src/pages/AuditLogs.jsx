import React, { useState, useEffect } from 'react';
import { auditLogsAPI } from '../services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await auditLogsAPI.getAll();
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="audit-logs-page">
      <div>
        <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Audit Logs</h1>
        <p className="text-muted-foreground">Historique des actions</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : logs.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucun log disponible</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log._id} className="hover:shadow-sm transition-shadow bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 border-0">{log.resourceType}</Badge>
                    <span className="text-sm text-foreground">
                      <span className="font-medium">{log.user?.firstName} {log.user?.lastName}</span>
                      {' '}{log.action}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
