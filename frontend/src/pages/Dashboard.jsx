import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Briefcase, CheckSquare, TrendingUp, Calendar, FileText, Award, Clock, Target, Activity } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#0066CC', '#3399FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue', subtitle }) => {
  const colorClasses = {
    blue: 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400',
    green: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
    orange: 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-brand-500" data-testid={`stat-card-${title.toLowerCase().replace(/ /g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">{value}</h3>
              {trendValue && (
                <span className={`text-sm font-medium flex items-center gap-1 ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {trend === 'up' ? '↑' : '↓'} {trendValue}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
          </div>
          <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
            <Icon size={28} strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getOverview();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const internsByStatusData = stats?.charts?.internsByStatus?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const departmentData = stats?.charts?.internsByDepartment?.map(item => ({
    name: item._id || 'Non assigné',
    count: item.count
  })) || [];

  const taskStatusData = stats?.charts?.tasksByStatus?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  // Mock data for performance chart
  const performanceData = [
    { month: 'Jan', active: 12, completed: 8 },
    { month: 'Fév', active: 15, completed: 10 },
    { month: 'Mar', active: 18, completed: 12 },
    { month: 'Avr', active: 20, completed: 15 },
    { month: 'Mai', active: 22, completed: 18 },
    { month: 'Juin', active: 25, completed: 20 },
  ];

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">
            {t('welcome')}, <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">{user?.firstName}</span> !
          </h1>
          <p className="text-muted-foreground">{t('overview')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="px-4 py-2 bg-brand-50 dark:bg-brand-950 border-brand-200 dark:border-brand-800">
            <div className="flex items-center gap-2">
              <Clock className="text-brand-600 dark:text-brand-400" size={18} />
              <span className="text-sm font-medium">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('activeInterns')}
          value={stats?.stats?.activeInterns || 0}
          icon={Users}
          trend="up"
          trendValue="+12%"
          color="blue"
          subtitle={`4 ${t('newThisMonth')}`}
        />
        <StatCard
          title={t('completedTasks')}
          value={stats?.stats?.completedTasks || 0}
          icon={CheckSquare}
          trend="up"
          trendValue="+8%"
          color="green"
          subtitle={`${t('on')} ${stats?.stats?.totalTasks || 0} total`}
        />
        <StatCard
          title={t('pendingReports')}
          value={stats?.stats?.pendingReports || 0}
          icon={FileText}
          color="orange"
          subtitle={t('toReviewThisWeek')}
        />
        <StatCard
          title={t('applications')}
          value={stats?.stats?.totalApplications || 0}
          icon={Briefcase}
          trend="up"
          trendValue="+5"
          color="purple"
          subtitle={`5 ${t('thisWeek')}`}
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Evolution Chart */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow" data-testid="performance-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-brand-500" size={20} />
              {t('internEvolution')}
            </CardTitle>
            <CardDescription>{t('comparisonActiveVsCompleted')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066CC" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0066CC" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="active" stroke="#0066CC" fillOpacity={1} fill="url(#colorActive)" name="Actifs" />
                <Area type="monotone" dataKey="completed" stroke="#10B981" fillOpacity={1} fill="url(#colorCompleted)" name="Terminés" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="hover:shadow-lg transition-shadow" data-testid="chart-by-status">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="text-brand-500" size={20} />
              {t('statusDistribution')}
            </CardTitle>
            <CardDescription>{t('internDistribution')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={internsByStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.substring(0, 10)} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {internsByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department & Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <Card className="hover:shadow-lg transition-shadow" data-testid="chart-by-department">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-brand-500" size={20} />
              {t('internsByDepartment')}
            </CardTitle>
            <CardDescription>{t('departmentDistribution')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="count" fill="#0066CC" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Status */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="text-brand-500" size={20} />
              {t('taskStatus')}
            </CardTitle>
            <CardDescription>{t('taskProgress')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" fill="#3399FF" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Evaluations */}
      <Card className="hover:shadow-lg transition-shadow" data-testid="recent-evaluations">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="text-brand-500" size={20} />
            {t('recentEvaluations')}
          </CardTitle>
          <CardDescription>{t('lastEvaluations')}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentEvaluations?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune évaluation récente</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentEvaluations?.map((evaluation) => (
                <div
                  key={evaluation._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-lg">
                      {evaluation.intern?.firstName?.[0]}{evaluation.intern?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-brand-600 transition-colors">
                        {evaluation.intern?.firstName} {evaluation.intern?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{evaluation.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Award className="text-brand-500" size={16} />
                      <p className="text-2xl font-bold text-brand-600">{evaluation.overallScore?.toFixed(1)}</p>
                      <span className="text-muted-foreground">/5</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(evaluation.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
