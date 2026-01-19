import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Calendar as CalendarIcon, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TaskManager({ dealId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    due_date: null,
    priority: 'medium'
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['deal-tasks', dealId],
    queryFn: () => base44.entities.DealTask.filter({ deal_pipeline_id: dealId })
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData) => base44.entities.DealTask.create({
      ...taskData,
      deal_pipeline_id: dealId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-tasks', dealId] });
      setShowForm(false);
      setTaskForm({ title: '', description: '', due_date: null, priority: 'medium' });
      toast.success('Task created');
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }) => base44.entities.DealTask.update(taskId, updates),
    onSuccess: async (_, { updates }) => {
      queryClient.invalidateQueries({ queryKey: ['deal-tasks', dealId] });
      
      // Notify if task completed
      if (updates.status === 'completed') {
        try {
          await base44.functions.invoke('notifyDealUpdate', {
            dealId,
            updateType: 'task_completed',
            details: { taskTitle: updates.title || 'Task' }
          });
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
      }
      
      toast.success('Task updated');
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => base44.entities.DealTask.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-tasks', dealId] });
      toast.success('Task deleted');
    }
  });

  const toggleTaskStatus = (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTaskMutation.mutate({
      taskId: task.id,
      updates: {
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        title: task.title
      }
    });
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tasks ({tasks.length})</h3>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Task
        </Button>
      </div>

      {showForm && (
        <div className="card-dark p-4 space-y-3">
          <div>
            <Label>Task Title</Label>
            <Input
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="e.g., Review financials"
            />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Task details..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Priority</Label>
              <div className="flex gap-2 mt-1">
                {['low', 'medium', 'high'].map(p => (
                  <Badge
                    key={p}
                    onClick={() => setTaskForm({ ...taskForm, priority: p })}
                    className={`cursor-pointer ${
                      taskForm.priority === p ? priorityColors[p] : 'bg-[#0f0618]'
                    }`}
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {taskForm.due_date ? format(new Date(taskForm.due_date), 'MMM d, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={taskForm.due_date ? new Date(taskForm.due_date) : undefined}
                    onSelect={(date) => setTaskForm({ ...taskForm, due_date: date?.toISOString() })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => createTaskMutation.mutate(taskForm)}
              disabled={!taskForm.title || createTaskMutation.isPending}
              className="flex-1"
            >
              {createTaskMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Task'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#8b85f7]" />
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`card-dark p-3 flex items-start gap-3 ${
                task.status === 'completed' ? 'opacity-60' : ''
              }`}
            >
              <button
                onClick={() => toggleTaskStatus(task)}
                className="mt-1"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${task.status === 'completed' ? 'line-through' : ''}`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={priorityColors[task.priority]} variant="outline">
                    {task.priority}
                  </Badge>
                  {task.due_date && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {format(new Date(task.due_date), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTaskMutation.mutate(task.id)}
                className="text-gray-500 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {tasks.length === 0 && !showForm && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No tasks yet. Add one to get started!
            </div>
          )}
        </div>
      )}
    </div>
  );
}