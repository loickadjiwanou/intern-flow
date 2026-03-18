import React, { useState, useEffect } from 'react';
import { evaluationsAPI, internsAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Plus, Star, User, Calendar, Search, Filter, Eye, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const evaluationTypes = ['Monthly', 'Mid-term', 'Final', 'Performance Review'];

const criteriaLabels = {
  technicalSkills: { label: 'Technical Skills', description: 'Knowledge and application of technical concepts' },
  communication: { label: 'Communication', description: 'Verbal and written communication ability' },
  autonomy: { label: 'Autonomy', description: 'Ability to work independently' },
  teamwork: { label: 'Teamwork', description: 'Collaboration and team contribution' },
  deadlineRespect: { label: 'Deadline Respect', description: 'Punctuality and time management' },
};

export default function Evaluations() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    intern: '',
    type: 'Monthly',
    criteria: {
      technicalSkills: { score: 3, comment: '' },
      communication: { score: 3, comment: '' },
      autonomy: { score: 3, comment: '' },
      teamwork: { score: 3, comment: '' },
      deadlineRespect: { score: 3, comment: '' },
    },
    generalComment: '',
    strengths: '',
    areasForImprovement: '',
    recommendations: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [evaluationsRes, internsRes] = await Promise.all([
        evaluationsAPI.getAll(),
        internsAPI.getAll(),
      ]);
      setEvaluations(evaluationsRes.data.evaluations || []);
      setInterns(internsRes.data.interns || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load evaluations');
    } finally {
      setLoading(false);
    }
  };

  const handleCriteriaChange = (criterion, field, value) => {
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [criterion]: {
          ...prev.criteria[criterion],
          [field]: value,
        },
      },
    }));
  };

  const calculateOverallScore = () => {
    const scores = Object.values(formData.criteria).map(c => c.score);
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.intern) {
      toast.error('Please select an intern');
      return;
    }

    setIsSubmitting(true);
    try {
      await evaluationsAPI.create(formData);
      toast.success('Evaluation created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to create evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this evaluation?')) return;
    try {
      await evaluationsAPI.delete(id);
      toast.success('Evaluation deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete evaluation');
    }
  };

  const resetForm = () => {
    setFormData({
      intern: '',
      type: 'Monthly',
      criteria: {
        technicalSkills: { score: 3, comment: '' },
        communication: { score: 3, comment: '' },
        autonomy: { score: 3, comment: '' },
        teamwork: { score: 3, comment: '' },
        deadlineRespect: { score: 3, comment: '' },
      },
      generalComment: '',
      strengths: '',
      areasForImprovement: '',
      recommendations: '',
    });
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = 
      evaluation.intern?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evaluation.intern?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || evaluation.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getScoreColor = (score) => {
    if (score >= 4) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
    if (score >= 3) return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    if (score >= 2) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
    return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
  };

  return (
    <div className="space-y-6" data-testid="evaluations-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Evaluations</h1>
          <p className="text-muted-foreground">Intern performance evaluations</p>
        </div>
        {['Admin', 'HR', 'Manager'].includes(user?.role) && (
          <Button 
            className="bg-brand-600 hover:bg-brand-700" 
            onClick={() => setIsCreateDialogOpen(true)}
            data-testid="add-evaluation-button"
          >
            <Plus size={18} className="mr-2" />
            New Evaluation
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by intern name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {evaluationTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : filteredEvaluations.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="py-12 text-center">
            <Star size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No evaluations found</p>
            <p className="text-sm text-muted-foreground">
              Click "New Evaluation" to create one
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvaluations.map((evaluation) => (
            <Card key={evaluation._id} className="hover:shadow-lg transition-shadow bg-card group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-300 font-semibold">
                      {evaluation.intern?.firstName?.[0]}{evaluation.intern?.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {evaluation.intern?.firstName} {evaluation.intern?.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{evaluation.type}</p>
                    </div>
                  </div>
                  <Badge className={`${getScoreColor(evaluation.overallScore)} border-0`}>
                    <Star size={14} className="mr-1" />
                    {evaluation.overallScore?.toFixed(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{evaluation.generalComment}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(evaluation.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedEvaluation(evaluation);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye size={16} />
                    </Button>
                    {['Admin', 'HR'].includes(user?.role) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(evaluation._id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Evaluation Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Evaluation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Intern *</Label>
                <Select value={formData.intern} onValueChange={(value) => setFormData({ ...formData, intern: value })}>
                  <SelectTrigger data-testid="intern-select">
                    <SelectValue placeholder="Select intern" />
                  </SelectTrigger>
                  <SelectContent>
                    {interns.map((intern) => (
                      <SelectItem key={intern._id} value={intern._id}>
                        {intern.firstName} {intern.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {evaluationTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Criteria */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Evaluation Criteria</h4>
                <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 border-0">
                  Overall: {calculateOverallScore()}/5
                </Badge>
              </div>
              
              {Object.entries(criteriaLabels).map(([key, { label, description }]) => (
                <Card key={key} className="bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                      <Badge variant="outline" className="text-lg px-3">
                        {formData.criteria[key].score}/5
                      </Badge>
                    </div>
                    <Slider
                      value={[formData.criteria[key].score]}
                      onValueChange={([value]) => handleCriteriaChange(key, 'score', value)}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <Input
                      placeholder={`Comment on ${label.toLowerCase()}`}
                      value={formData.criteria[key].comment}
                      onChange={(e) => handleCriteriaChange(key, 'comment', e.target.value)}
                      className="bg-background"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comments */}
            <div className="space-y-4">
              <div>
                <Label>General Comments</Label>
                <Textarea
                  value={formData.generalComment}
                  onChange={(e) => setFormData({ ...formData, generalComment: e.target.value })}
                  placeholder="Overall assessment of the intern's performance..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Strengths</Label>
                  <Textarea
                    value={formData.strengths}
                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                    placeholder="Key strengths observed..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Areas for Improvement</Label>
                  <Textarea
                    value={formData.areasForImprovement}
                    onChange={(e) => setFormData({ ...formData, areasForImprovement: e.target.value })}
                    placeholder="Areas that need development..."
                    rows={2}
                  />
                </div>
              </div>
              <div>
                <Label>Recommendations</Label>
                <Textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  placeholder="Recommendations for future development..."
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700" data-testid="submit-evaluation-button">
                {isSubmitting ? 'Creating...' : 'Create Evaluation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Evaluation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-300 font-semibold">
                {selectedEvaluation?.intern?.firstName?.[0]}{selectedEvaluation?.intern?.lastName?.[0]}
              </div>
              <div>
                <p>{selectedEvaluation?.intern?.firstName} {selectedEvaluation?.intern?.lastName}</p>
                <p className="text-sm font-normal text-muted-foreground">{selectedEvaluation?.type} Evaluation</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvaluation && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Badge className={`${getScoreColor(selectedEvaluation.overallScore)} border-0 text-lg px-4 py-1`}>
                  <Star size={18} className="mr-2" />
                  Overall Score: {selectedEvaluation.overallScore?.toFixed(1)}/5
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedEvaluation.createdAt).toLocaleDateString()}
                </p>
              </div>

              {selectedEvaluation.criteria && (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selectedEvaluation.criteria).map(([key, data]) => (
                    <div key={key} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{criteriaLabels[key]?.label || key}</p>
                        <Badge variant="outline">{data.score}/5</Badge>
                      </div>
                      {data.comment && (
                        <p className="text-xs text-muted-foreground">{data.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedEvaluation.generalComment && (
                <div>
                  <h4 className="font-medium mb-2">General Comments</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvaluation.generalComment}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedEvaluation.strengths && (
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">Strengths</h4>
                    <p className="text-sm text-muted-foreground">{selectedEvaluation.strengths}</p>
                  </div>
                )}
                {selectedEvaluation.areasForImprovement && (
                  <div>
                    <h4 className="font-medium mb-2 text-amber-600">Areas for Improvement</h4>
                    <p className="text-sm text-muted-foreground">{selectedEvaluation.areasForImprovement}</p>
                  </div>
                )}
              </div>

              {selectedEvaluation.recommendations && (
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvaluation.recommendations}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
