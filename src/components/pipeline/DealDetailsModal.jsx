import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, CheckCircle, Clock, Bell, MessageSquare } from 'lucide-react';
import CommentSection from '@/components/collaboration/CommentSection';

export default function DealDetailsModal({ open, onClose, deal }) {
  const queryClient = useQueryClient();
  const [newTask, setNewTask] = useState({ title: '', due_date: '' });
  const [newReminder, setNewReminder] = useState({ reminder_type: 'follow_up', reminder_date: '', message: '' });
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: tasks = [] } = useQuery({
    queryKey: ['deal-tasks', deal?.id],
    queryFn: () => base44.entities.DealTask.filter({ deal_pipeline_id: deal.id }),
    enabled: !!deal
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['deal-reminders', deal?.id],
    queryFn: () => base44.entities.DealReminder.filter({ deal_pipeline_id: deal.id }),
    enabled: !!deal
  });

  const addTaskMutation = useMutation({
    mutationFn: (taskData) => base44.entities.DealTask.create(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-tasks'] });
      setNewTask({ title: '', due_date: '' });
      toast.success('Task added');
    }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, completed }) => base44.entities.DealTask.update(id, {
      status: completed ? 'completed' : 'pending',
      completed_at: completed ? new Date().toISOString() : null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-tasks'] });
    }
  });

  const addReminderMutation = useMutation({
    mutationFn: (reminderData) => base44.entities.DealReminder.create(reminderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-reminders'] });
      setNewReminder({ reminder_type: 'follow_up', reminder_date: '', message: '' });
      toast.success('Reminder scheduled');
    }
  });

  if (!deal) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {deal.deal_name}
            <Badge>{deal.stage}</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="reminders">Reminders ({reminders.length})</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <Badge>{deal.priority}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Value</p>
                <p className="font-semibold">${(deal.estimated_value || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expected Close</p>
                <p className="font-semibold">
                  {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="font-semibold">{deal.progress_percentage || 0}%</p>
              </div>
            </div>

            {deal.deal_description && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-sm">{deal.deal_description}</p>
              </div>
            )}

            {deal.stage_history && deal.stage_history.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Stage History</p>
                <div className="space-y-2">
                  {deal.stage_history.slice().reverse().map((entry, idx) => (
                    <div key={idx} className="text-xs flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{entry.stage}</Badge>
                      <span className="text-gray-500">
                        {new Date(entry.entered_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Task title..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <Input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                className="w-40"
              />
              <Button 
                size="icon"
                onClick={() => addTaskMutation.mutate({
                  deal_pipeline_id: deal.id,
                  ...newTask,
                  assigned_to: user?.email
                })}
                disabled={!newTask.title}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {tasks.map(task => (
                <Card key={task.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <button onClick={() => toggleTaskMutation.mutate({ 
                      id: task.id, 
                      completed: task.status !== 'completed' 
                    })}>
                      {task.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </p>
                      {task.due_date && (
                        <p className="text-xs text-gray-500">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {tasks.length === 0 && (
                <p className="text-center text-gray-500 py-4 text-sm">No tasks yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <div className="space-y-2">
              <select
                value={newReminder.reminder_type}
                onChange={(e) => setNewReminder({ ...newReminder, reminder_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="follow_up">Follow Up</option>
                <option value="stage_review">Stage Review</option>
                <option value="task_due">Task Due</option>
                <option value="deadline">Deadline</option>
              </select>
              <Input
                type="datetime-local"
                value={newReminder.reminder_date}
                onChange={(e) => setNewReminder({ ...newReminder, reminder_date: e.target.value })}
              />
              <Textarea
                placeholder="Reminder message..."
                value={newReminder.message}
                onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
                rows={2}
              />
              <Button 
                onClick={() => addReminderMutation.mutate({
                  deal_pipeline_id: deal.id,
                  ...newReminder,
                  recipient_email: user?.email,
                  reminder_date: new Date(newReminder.reminder_date).toISOString()
                })}
                disabled={!newReminder.reminder_date || !newReminder.message}
                className="w-full"
              >
                <Bell className="w-4 h-4 mr-2" />
                Schedule Reminder
              </Button>
            </div>

            <div className="space-y-2">
              {reminders.map(reminder => (
                <Card key={reminder.id} className={reminder.is_sent ? 'opacity-60' : ''}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="capitalize">
                        {reminder.reminder_type.replace('_', ' ')}
                      </Badge>
                      {reminder.is_sent ? (
                        <Badge className="bg-green-100 text-green-700">Sent</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                      )}
                    </div>
                    <p className="text-sm mb-1">{reminder.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(reminder.reminder_date).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {reminders.length === 0 && (
                <p className="text-center text-gray-500 py-4 text-sm">No reminders scheduled</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="discussion">
            <CommentSection dealId={deal.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}