import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { internsAPI, tasksAPI, evaluationsAPI, eventsAPI, usersAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Calendar as CalendarIcon, Users, CheckSquare, Star, Clock, MapPin, X, Trash2, Edit } from 'lucide-react';
import './Calendar.css';

moment.locale('en');
const localizer = momentLocalizer(moment);

const eventTypeConfig = {
  intern: { color: '#0066CC', label: 'Intern' },
  task: { color: '#10B981', label: 'Task' },
  evaluation: { color: '#F59E0B', label: 'Evaluation' },
  meeting: { color: '#8B5CF6', label: 'Meeting' },
  deadline: { color: '#EF4444', label: 'Deadline' },
  training: { color: '#06B6D4', label: 'Training' },
  review: { color: '#EC4899', label: 'Review' },
  other: { color: '#6B7280', label: 'Other' },
};

const eventStyleGetter = (event) => {
  const config = eventTypeConfig[event.type] || eventTypeConfig.other;
  return {
    style: {
      backgroundColor: config.color,
      borderRadius: '6px',
      opacity: 0.9,
      color: 'white',
      border: 'none',
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
  };
};

export default function Calendar() {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [customEvents, setCustomEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    type: 'meeting',
    start: '',
    end: '',
    allDay: false,
    location: '',
    participants: [],
    intern: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [internsRes, tasksRes, evaluationsRes, eventsRes, usersRes] = await Promise.all([
        internsAPI.getAll(),
        tasksAPI.getAll(),
        evaluationsAPI.getAll(),
        eventsAPI.getAll(),
        usersAPI.getAll(),
      ]);

      setUsers(usersRes.data.users || []);
      setInterns(internsRes.data.interns || []);
      setCustomEvents(eventsRes.data.events || []);

      const calendarEvents = [];

      // Add intern start/end dates
      (internsRes.data.interns || []).forEach((intern) => {
        if (intern.startDate) {
          calendarEvents.push({
            id: `intern-start-${intern._id}`,
            title: `🎓 Start: ${intern.firstName} ${intern.lastName}`,
            start: new Date(intern.startDate),
            end: new Date(intern.startDate),
            type: 'intern',
            resource: { type: 'intern', action: 'start', data: intern },
          });
        }
        if (intern.endDate) {
          calendarEvents.push({
            id: `intern-end-${intern._id}`,
            title: `🎉 End: ${intern.firstName} ${intern.lastName}`,
            start: new Date(intern.endDate),
            end: new Date(intern.endDate),
            type: 'intern',
            resource: { type: 'intern', action: 'end', data: intern },
          });
        }
      });

      // Add task deadlines
      (tasksRes.data.tasks || []).forEach((task) => {
        if (task.deadline) {
          calendarEvents.push({
            id: `task-${task._id}`,
            title: `✓ ${task.title}`,
            start: new Date(task.deadline),
            end: new Date(task.deadline),
            type: 'task',
            resource: { type: 'task', data: task },
          });
        }
      });

      // Add evaluations
      (evaluationsRes.data.evaluations || []).forEach((evaluation) => {
        calendarEvents.push({
          id: `eval-${evaluation._id}`,
          title: `⭐ Evaluation: ${evaluation.intern?.firstName} ${evaluation.intern?.lastName}`,
          start: new Date(evaluation.createdAt),
          end: new Date(evaluation.createdAt),
          type: 'evaluation',
          resource: { type: 'evaluation', data: evaluation },
        });
      });

      // Add custom events
      (eventsRes.data.events || []).forEach((event) => {
        calendarEvents.push({
          id: `event-${event._id}`,
          _id: event._id,
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
          type: event.type,
          allDay: event.allDay,
          description: event.description,
          location: event.location,
          participants: event.participants,
          resource: { type: 'custom', data: event },
          isCustom: true,
        });
      });

      setEvents(calendarEvents);

      // Get upcoming events (next 7 days)
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = calendarEvents
        .filter((event) => event.start >= today && event.start <= nextWeek)
        .sort((a, b) => a.start - b.start)
        .slice(0, 5);
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = ({ start, end }) => {
    setEventForm({
      title: '',
      description: '',
      type: 'meeting',
      start: moment(start).format('YYYY-MM-DDTHH:mm'),
      end: moment(end).format('YYYY-MM-DDTHH:mm'),
      allDay: false,
      location: '',
      participants: [],
      intern: '',
      color: '#3b82f6',
    });
    setSelectedEvent(null);
    setIsCreateDialogOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    if (event.isCustom) {
      setEventForm({
        title: event.title,
        description: event.description || '',
        type: event.type,
        start: moment(event.start).format('YYYY-MM-DDTHH:mm'),
        end: moment(event.end).format('YYYY-MM-DDTHH:mm'),
        allDay: event.allDay || false,
        location: event.location || '',
        participants: event.participants?.map(p => p._id) || [],
        intern: event.resource?.data?.intern?._id || '',
        color: event.resource?.data?.color || '#3b82f6',
      });
    }
    setIsViewDialogOpen(true);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.start || !eventForm.end) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const eventData = {
        ...eventForm,
        start: new Date(eventForm.start),
        end: new Date(eventForm.end),
        participants: eventForm.participants || [],
        intern: eventForm.intern || undefined,
      };

      if (selectedEvent?.isCustom && selectedEvent._id) {
        await eventsAPI.update(selectedEvent._id, eventData);
        toast.success('Event updated successfully');
      } else {
        await eventsAPI.create(eventData);
        toast.success('Event created successfully');
      }

      setIsCreateDialogOpen(false);
      setIsViewDialogOpen(false);
      resetForm();
      fetchAllData();
    } catch (error) {
      toast.error('Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent?._id || !selectedEvent.isCustom) return;

    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventsAPI.delete(selectedEvent._id);
      toast.success('Event deleted successfully');
      setIsViewDialogOpen(false);
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      type: 'meeting',
      start: '',
      end: '',
      allDay: false,
      location: '',
      participants: [],
      intern: '',
      color: '#3b82f6',
    });
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="calendar-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">Calendar</h1>
          <p className="text-muted-foreground">Event planning and tracking</p>
        </div>
        <Button className="bg-brand-600 hover:bg-brand-700" onClick={() => {
          resetForm();
          setEventForm(prev => ({
            ...prev,
            start: moment().format('YYYY-MM-DDTHH:mm'),
            end: moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
          }));
          setIsCreateDialogOpen(true);
        }} data-testid="create-event-button">
          <Plus size={18} className="mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <div className="calendar-container" style={{ height: '600px' }}>
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                messages={{
                  today: "Today",
                  previous: 'Previous',
                  next: 'Next',
                  month: 'Month',
                  week: 'Week',
                  day: 'Day',
                  agenda: 'Agenda',
                  date: 'Date',
                  time: 'Time',
                  event: 'Event',
                  noEventsInRange: 'No events in this period',
                  showMore: (total) => `+ ${total} more`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Legend */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CalendarIcon size={18} className="text-brand-500" />
                Legend
              </h3>
              <div className="space-y-2">
                {Object.entries(eventTypeConfig).map(([type, config]) => (
                  <div key={type} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: config.color }}></div>
                    <span className="text-sm">{config.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Upcoming Events</h3>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const icons = {
                      intern: <Users size={16} className="text-brand-500" />,
                      task: <CheckSquare size={16} className="text-emerald-500" />,
                      evaluation: <Star size={16} className="text-orange-500" />,
                      meeting: <Users size={16} className="text-purple-500" />,
                      deadline: <Clock size={16} className="text-red-500" />,
                    };
                    return (
                      <div
                        key={event.id}
                        className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => handleSelectEvent(event)}
                      >
                        <div className="flex items-start gap-2">
                          {icons[event.type] || <CalendarIcon size={16} className="text-gray-500" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{event.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {moment(event.start).format('MMM DD, YYYY')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total events</span>
                  <Badge variant="secondary">{events.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Custom events</span>
                  <Badge className="bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 border-0">
                    {customEvents.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Next 7 days</span>
                  <Badge className="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 border-0">
                    {upcomingEvents.length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.isCustom ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Event title"
                required
                data-testid="event-title-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={eventForm.type} onValueChange={(value) => setEventForm({ ...eventForm, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="allDay"
                  checked={eventForm.allDay}
                  onCheckedChange={(checked) => setEventForm({ ...eventForm, allDay: checked })}
                />
                <Label htmlFor="allDay">All day</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start *</Label>
                <Input
                  type="datetime-local"
                  value={eventForm.start}
                  onChange={(e) => setEventForm({ ...eventForm, start: e.target.value })}
                  required
                  data-testid="event-start-input"
                />
              </div>
              <div>
                <Label>End *</Label>
                <Input
                  type="datetime-local"
                  value={eventForm.end}
                  onChange={(e) => setEventForm({ ...eventForm, end: e.target.value })}
                  required
                  data-testid="event-end-input"
                />
              </div>
            </div>

            <div>
              <Label>Location</Label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="Event location"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Related Intern (optional)</Label>
              <Select value={eventForm.intern} onValueChange={(value) => setEventForm({ ...eventForm, intern: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select intern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {interns.map((intern) => (
                    <SelectItem key={intern._id} value={intern._id}>
                      {intern.firstName} {intern.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Event description"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700" data-testid="save-event-button">
                {isSubmitting ? 'Saving...' : selectedEvent?.isCustom ? 'Update Event' : 'Create Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: eventTypeConfig[selectedEvent?.type]?.color || '#6B7280' }}
              ></div>
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} />
              <span>
                {selectedEvent && moment(selectedEvent.start).format('MMM DD, YYYY h:mm A')}
                {selectedEvent?.end && ` - ${moment(selectedEvent.end).format('h:mm A')}`}
              </span>
            </div>
            
            {selectedEvent?.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={16} />
                <span>{selectedEvent.location}</span>
              </div>
            )}
            
            {selectedEvent?.description && (
              <div className="pt-2">
                <p className="text-sm">{selectedEvent.description}</p>
              </div>
            )}
            
            <Badge className="capitalize">
              {eventTypeConfig[selectedEvent?.type]?.label || selectedEvent?.type}
            </Badge>
          </div>

          <DialogFooter>
            {selectedEvent?.isCustom && (
              <>
                <Button variant="outline" className="text-red-600" onClick={handleDeleteEvent}>
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  setIsCreateDialogOpen(true);
                }} className="bg-brand-600 hover:bg-brand-700">
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
              </>
            )}
            {!selectedEvent?.isCustom && (
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
