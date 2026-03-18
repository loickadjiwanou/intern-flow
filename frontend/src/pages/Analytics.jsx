import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  CheckSquare, 
  TrendingUp, 
  Award,
  GraduationCap,
  Building,
  Calendar,
  Briefcase,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter,
  FunnelChart,
  Funnel,
  LabelList,
  RadialBarChart,
  RadialBar,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const statusData = [
  { name: 'Candidat', value: 12, color: '#94a3b8' },
  { name: 'Entretien', value: 8, color: '#3b82f6' },
  { name: 'Accepté', value: 5, color: '#22c55e' },
  { name: 'Actif', value: 25, color: '#0ea5e9' },
  { name: 'Terminé', value: 18, color: '#a855f7' },
  { name: 'Embauché', value: 7, color: '#10b981' },
];

const monthlyData = [
  { month: 'Jan', stagiaires: 15, embauches: 2 },
  { month: 'Fév', stagiaires: 18, embauches: 3 },
  { month: 'Mar', stagiaires: 22, embauches: 4 },
  { month: 'Avr', stagiaires: 28, embauches: 5 },
  { month: 'Mai', stagiaires: 32, embauches: 6 },
  { month: 'Juin', stagiaires: 35, embauches: 7 },
];

const departmentData = [
  { name: 'IT', count: 28 },
  { name: 'Marketing', count: 15 },
  { name: 'Finance', count: 12 },
  { name: 'RH', count: 8 },
  { name: 'Commercial', count: 10 },
  { name: 'Design', count: 6 },
];

const universityData = [
  { name: 'Paris-Saclay', count: 15 },
  { name: 'Sorbonne', count: 12 },
  { name: 'Dauphine', count: 10 },
  { name: 'HEC', count: 8 },
  { name: 'Polytechnique', count: 6 },
  { name: 'Autres', count: 24 },
];

const performanceData = [
  { month: 'Jan', score: 3.8 },
  { month: 'Fév', score: 4.0 },
  { month: 'Mar', score: 4.2 },
  { month: 'Avr', score: 4.1 },
  { month: 'Mai', score: 4.4 },
  { month: 'Juin', score: 4.5 },
];

const taskCompletionData = [
  { month: 'Jan', completed: 45, total: 50 },
  { month: 'Fév', completed: 52, total: 58 },
  { month: 'Mar', completed: 68, total: 75 },
  { month: 'Avr', completed: 72, total: 80 },
  { month: 'Mai', completed: 85, total: 92 },
  { month: 'Juin', completed: 95, total: 100 },
];

// Radar chart data for skills assessment
const skillsRadarData = [
  { skill: 'Technical', A: 85, B: 90, fullMark: 100 },
  { skill: 'Communication', A: 75, B: 88, fullMark: 100 },
  { skill: 'Teamwork', A: 90, B: 85, fullMark: 100 },
  { skill: 'Problem Solving', A: 80, B: 82, fullMark: 100 },
  { skill: 'Leadership', A: 65, B: 70, fullMark: 100 },
  { skill: 'Adaptability', A: 88, B: 92, fullMark: 100 },
];

// Recruitment funnel data
const recruitmentFunnelData = [
  { name: 'Applications', value: 250, fill: '#3b82f6' },
  { name: 'Screening', value: 150, fill: '#22c55e' },
  { name: 'Interview', value: 80, fill: '#f59e0b' },
  { name: 'Assessment', value: 45, fill: '#8b5cf6' },
  { name: 'Offer', value: 25, fill: '#ec4899' },
  { name: 'Hired', value: 18, fill: '#10b981' },
];

// Weekly activity data
const weeklyActivityData = [
  { day: 'Mon', tasks: 12, messages: 8, evaluations: 2 },
  { day: 'Tue', tasks: 18, messages: 15, evaluations: 5 },
  { day: 'Wed', tasks: 15, messages: 12, evaluations: 3 },
  { day: 'Thu', tasks: 22, messages: 18, evaluations: 6 },
  { day: 'Fri', tasks: 20, messages: 14, evaluations: 4 },
  { day: 'Sat', tasks: 5, messages: 3, evaluations: 0 },
  { day: 'Sun', tasks: 2, messages: 1, evaluations: 0 },
];

// Progress radial data
const progressRadialData = [
  { name: 'Tasks Completed', value: 86, fill: '#3b82f6' },
  { name: 'Evaluations Done', value: 72, fill: '#22c55e' },
  { name: 'Reports Submitted', value: 68, fill: '#f59e0b' },
  { name: 'Attendance', value: 94, fill: '#8b5cf6' },
];

// Trend comparison data
const trendComparisonData = [
  { month: 'Jan', thisYear: 15, lastYear: 12 },
  { month: 'Feb', thisYear: 18, lastYear: 14 },
  { month: 'Mar', thisYear: 22, lastYear: 18 },
  { month: 'Apr', thisYear: 28, lastYear: 22 },
  { month: 'May', thisYear: 32, lastYear: 25 },
  { month: 'Jun', thisYear: 35, lastYear: 28 },
];

export default function Analytics() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getStats();
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-6" data-testid="analytics-page">
      <div>
        <h1 className="text-4xl font-heading font-bold text-foreground mb-2">{t('analytics')}</h1>
        <p className="text-muted-foreground">Statistiques et analyses détaillées de votre programme de stages</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Stagiaires</p>
                <p className="text-3xl font-bold">{stats.totalInterns || 75}</p>
                <p className="text-blue-100 text-xs mt-1">+12% ce mois</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Users size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Stagiaires Actifs</p>
                <p className="text-3xl font-bold">{stats.activeInterns || 25}</p>
                <p className="text-green-100 text-xs mt-1">En cours actuellement</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Briefcase size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Taux de Conversion</p>
                <p className="text-3xl font-bold">{stats.conversionRate || '28%'}</p>
                <p className="text-purple-100 text-xs mt-1">Stagiaire → Employé</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm mb-1">Note Moyenne</p>
                <p className="text-3xl font-bold">{stats.averageScore || '4.2'}/5</p>
                <p className="text-amber-100 text-xs mt-1">Évaluations</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Award size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 dark:bg-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="interns">Interns</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evolution Chart */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Calendar size={20} className="text-brand-600" />
                  Évolution Mensuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorStagiaires" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEmbauches" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }} 
                    />
                    <Legend />
                    <Area type="monotone" dataKey="stagiaires" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStagiaires)" name="Stagiaires" />
                    <Area type="monotone" dataKey="embauches" stroke="#10b981" fillOpacity={1} fill="url(#colorEmbauches)" name="Embauches" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution Pie Chart */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Users size={20} className="text-brand-600" />
                  Répartition par Statut
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Interns Tab */}
        <TabsContent value="interns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Department */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Building size={20} className="text-brand-600" />
                  Par Département
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }} 
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Stagiaires" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* By University */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <GraduationCap size={20} className="text-brand-600" />
                  Par Université/École
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={universityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {universityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Award size={20} className="text-brand-600" />
                Évolution des Scores d'Évaluation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 5]} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                    name="Score moyen"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
                  <p className="text-4xl font-bold text-foreground">{stats.totalTasks || 485}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Tasks Completed</p>
                  <p className="text-4xl font-bold text-green-600">{stats.completedTasks || 417}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                  <p className="text-4xl font-bold text-brand-600">86%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <CheckSquare size={20} className="text-brand-600" />
                Task Completion by Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={taskCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" fill="#e2e8f0" name="Total" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recruitment Tab - NEW */}
        <TabsContent value="recruitment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recruitment Funnel */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Target size={20} className="text-brand-600" />
                  Recruitment Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <FunnelChart>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Funnel
                      dataKey="value"
                      data={recruitmentFunnelData}
                      isAnimationActive
                    >
                      <LabelList position="center" fill="#fff" stroke="none" dataKey="name" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Year over Year Comparison */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <TrendingUp size={20} className="text-brand-600" />
                  Year over Year Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={trendComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="thisYear" fill="#3b82f6" name="This Year" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="lastYear" stroke="#94a3b8" strokeWidth={2} name="Last Year" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab - NEW */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills Radar */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Award size={20} className="text-brand-600" />
                  Skills Assessment Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart outerRadius={120} data={skillsRadarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="skill" stroke="hsl(var(--muted-foreground))" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                    <Radar name="Current Cohort" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                    <Radar name="Previous Cohort" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Legend />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Clock size={20} className="text-brand-600" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={weeklyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="tasks" fill="#3b82f6" name="Tasks" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="messages" fill="#22c55e" name="Messages" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="evaluations" fill="#f59e0b" name="Evaluations" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Progress Radial */}
            <Card className="bg-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Target size={20} className="text-brand-600" />
                  Overall Progress Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="20%" 
                    outerRadius="90%" 
                    data={progressRadialData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar
                      minAngle={15}
                      background
                      clockWise
                      dataKey="value"
                      cornerRadius={10}
                    />
                    <Legend 
                      iconSize={10} 
                      layout="horizontal" 
                      verticalAlign="bottom"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                      formatter={(value) => [`${value}%`, 'Progress']}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
