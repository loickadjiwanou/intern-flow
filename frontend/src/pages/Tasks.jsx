import React, { useState, useEffect } from 'react';
import { tasksAPI, internsAPI } from '../services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, GripVertical, Calendar, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const statusColumns = [
  { id: 'Todo', title: 'À faire', color: 'bg-slate-100 dark:bg-slate-800', borderColor: 'border-slate-300 dark:border-slate-600' },
  { id: 'In Progress', title: 'En cours', color: 'bg-blue-50 dark:bg-blue-900/30', borderColor: 'border-blue-300 dark:border-blue-700' },
  { id: 'Review', title: 'En revue', color: 'bg-purple-50 dark:bg-purple-900/30', borderColor: 'border-purple-300 dark:border-purple-700' },
  { id: 'Done', title: 'Terminé', color: 'bg-green-50 dark:bg-green-900/30', borderColor: 'border-green-300 dark:border-green-700' },
];

const priorityColors = {
  'Low': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  'Medium': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  'High': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
  'Urgent': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
};

const priorityDots = {
  'Low': 'bg-slate-400',
  'Medium': 'bg-blue-500',
  'High': 'bg-orange-500',
  'Urgent': 'bg-red-500',
};

// Sortable Task Card Component
function SortableTaskCard({ task, onStatusChange }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card 
        className={`group cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 bg-card border-l-4 ${
          task.priority === 'Urgent' ? 'border-l-red-500' : 
          task.priority === 'High' ? 'border-l-orange-500' : 
          task.priority === 'Medium' ? 'border-l-blue-500' : 'border-l-slate-400'
        }`}
        data-testid={`task-card-${task._id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <div {...listeners} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
              <GripVertical size={16} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground mb-1 line-clamp-2">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
              )}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Badge className={`${priorityColors[task.priority]} border-0 text-xs`}>
                    {task.priority}
                  </Badge>
                  {task.deadline && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(task.deadline)}
                    </span>
                  )}
                </div>
                {task.assignedTo && (
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-xs font-medium text-brand-600 dark:text-brand-300">
                      {task.assignedTo?.firstName?.[0]}{task.assignedTo?.lastName?.[0]}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Task Card for Drag Overlay
function TaskCardOverlay({ task }) {
  return (
    <Card className="shadow-xl bg-card border-2 border-brand-500 rotate-3">
      <CardContent className="p-4">
        <h4 className="font-medium text-foreground mb-1">{task.title}</h4>
        <Badge className={`${priorityColors[task.priority]} border-0 text-xs`}>
          {task.priority}
        </Badge>
      </CardContent>
    </Card>
  );
}

// Droppable Column Component
function DroppableColumn({ column, tasks, onStatusChange }) {
  const taskIds = tasks.map(t => t._id);

  return (
    <div className="min-w-[300px] w-[300px] flex flex-col" data-testid={`kanban-column-${column.id}`}>
      <div className={`${column.color} rounded-t-xl p-4 border-t border-x ${column.borderColor}`}>
        <h3 className="font-semibold text-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              column.id === 'Todo' ? 'bg-slate-500' :
              column.id === 'In Progress' ? 'bg-blue-500' :
              column.id === 'Review' ? 'bg-purple-500' : 'bg-green-500'
            }`} />
            {column.title}
          </span>
          <Badge variant="secondary" className="font-normal">{tasks.length}</Badge>
        </h3>
      </div>
      <div 
        className={`bg-muted/30 dark:bg-muted/20 rounded-b-xl p-3 border-x border-b ${column.borderColor} space-y-3 flex-1 min-h-[200px]`}
        data-column-id={column.id}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task._id} task={task} onStatusChange={onStatusChange} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground py-8">
            Déposez une tâche ici
          </div>
        )}
      </div>
    </div>
  );
}

export default function Tasks() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    deadline: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, internsRes] = await Promise.all([
        tasksAPI.getAll(),
        internsAPI.getAll({ status: 'Active Intern' }),
      ]);
      setTasks(tasksRes.data.tasks || []);
      setInterns(internsRes.data.interns || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await tasksAPI.create({ ...formData, status: 'Todo' });
      toast.success('Tâche créée avec succès');
      setOpen(false);
      setFormData({ title: '', description: '', assignedTo: '', priority: 'Medium', deadline: '' });
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la création de la tâche');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      // Update local state immediately for better UX
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      toast.success('Tâche déplacée');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      fetchData(); // Revert on error
    }
  };

  const handleDragStart = (event) => {
    const task = tasks.find(t => t._id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const task = tasks.find(t => t._id === taskId);
    
    // Find which column the task was dropped into
    const dropTarget = over.id;
    let newStatus = null;

    // Check if dropped on a column
    for (const column of statusColumns) {
      const columnTasks = tasks.filter(t => t.status === column.id);
      if (columnTasks.some(t => t._id === dropTarget) || dropTarget === column.id) {
        newStatus = column.id;
        break;
      }
    }

    // If dropped on another task, find its column
    if (!newStatus) {
      const targetTask = tasks.find(t => t._id === dropTarget);
      if (targetTask) {
        newStatus = targetTask.status;
      }
    }

    if (newStatus && task && task.status !== newStatus) {
      handleStatusChange(taskId, newStatus);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t._id === active.id);
    if (!activeTask) return;

    // Determine target column
    let targetColumn = null;
    for (const column of statusColumns) {
      const el = document.querySelector(`[data-column-id="${column.id}"]`);
      if (el && el.contains(event.activatorEvent?.target)) {
        targetColumn = column.id;
        break;
      }
    }
  };

  const getTasksByStatus = (status) => tasks.filter(task => task.status === status);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="tasks-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">{t('tasks')}</h1>
          <p className="text-muted-foreground">{t('taskManagement')}</p>
        </div>
        {['Admin', 'HR', 'Manager'].includes(user?.role) && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-600 hover:bg-brand-700" data-testid="add-task-button">
                <Plus size={18} className="mr-2" />
                {t('newTask')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle tâche</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <Label>{t('title')}</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="task-title-input"
                  />
                </div>
                <div>
                  <Label>{t('description')}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="task-description-input"
                  />
                </div>
                <div>
                  <Label>{t('assignedTo')}</Label>
                  <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                    <SelectTrigger data-testid="task-assignee-select">
                      <SelectValue placeholder="Sélectionner un stagiaire" />
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
                  <Label>{t('priority')}</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger data-testid="task-priority-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">{t('low')}</SelectItem>
                      <SelectItem value="Medium">{t('medium')}</SelectItem>
                      <SelectItem value="High">{t('high')}</SelectItem>
                      <SelectItem value="Urgent">{t('urgent')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('deadline')}</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    data-testid="task-deadline-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="create-task-button">
                  Créer la tâche
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {statusColumns.map((column) => {
          const count = getTasksByStatus(column.id).length;
          return (
            <Card key={column.id} className={`${column.color} border ${column.borderColor}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{column.title}</span>
                <span className="text-2xl font-bold text-foreground">{count}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex gap-6 overflow-x-auto pb-4" data-testid="kanban-board">
          {statusColumns.map((column) => (
            <DroppableColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
