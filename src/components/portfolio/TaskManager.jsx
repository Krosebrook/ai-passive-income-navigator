import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, Circle, AlertCircle, Plus, Trash2, Zap,
  Clock, Layers
} from 'lucide-react';

const STATUS_CONFIG = {
  todo: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100' },
  in_progress: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100' },
  completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100' },
  blocked: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100' }
};

const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700'
};

export default function TaskManager({ ideaId }) {
  const queryClient = useQueryClient();
  const [showAddTask, setShowAddTask] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'development',
    priority: 'medium',
    estimated_hours: 1
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['portfolioTasks', ideaId],
    queryFn: () => base44.entities.PortfolioTask.filter(
      { portfolio_idea_id: ideaId },
      '-due_date'
    )
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PortfolioTask.create({
      ...data,
      portfolio_idea_id: ideaId,
      assigned_to: 'self'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioTasks', ideaId] });
      setShowAddTask(false);
      setNewTask({
        title: '',
        description: '',
        category: 'development',
        priority: 'medium',
        estimated_hours: 1
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PortfolioTask.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolioTasks', ideaId] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PortfolioTask.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolioTasks', ideaId] })
  });

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-gray-500">Done</p>
            <p className="text-lg font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-500">In Progress</p>
            <p className="text-lg font-bold text-blue-600">{stats.inProgress}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-gray-500">Blocked</p>
            <p className="text-lg font-bold text-red-600">{stats.blocked}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'todo', 'in_progress', 'completed', 'blocked'].map(status => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
            className="text-xs"
          >
            {status === 'all' ? 'All Tasks' : status.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Task List */}
      <AnimatePresence>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks {filter !== 'all' ? 'in this status' : 'yet'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task, idx) => {
              const StatusIcon = STATUS_CONFIG[task.status].icon;
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    STATUS_CONFIG[task.status].bg
                  }`}
                  onClick={() => updateMutation.mutate({
                    id: task.id,
                    data: {
                      status: task.status === 'completed' ? 'todo' : 'completed',
                      completed_at: task.status === 'completed' ? null : new Date().toISOString()
                    }
                  })}
                >
                  <div className="flex items-start gap-3">
                    <StatusIcon className={`w-5 h-5 mt-1 flex-shrink-0 ${STATUS_CONFIG[task.status].color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-medium text-sm ${
                          task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h4>
                        <Badge className={PRIORITY_COLORS[task.priority]} variant="outline">
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.category}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                      )}
                      {task.due_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          📅 {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(task.id);
                      }}
                      className="h-8 w-8 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Add Task Button */}
      <Button
        onClick={() => setShowAddTask(true)}
        variant="outline"
        className="w-full gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Task
      </Button>

      {/* Add Task Modal */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-600" />
              Add Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Task Title</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g., Set up email marketing"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task details..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select
                  value={newTask.category}
                  onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['setup', 'marketing', 'development', 'optimization', 'legal', 'financial'].map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Est. Hours</label>
              <Input
                type="number"
                value={newTask.estimated_hours}
                onChange={(e) => setNewTask({ ...newTask, estimated_hours: parseFloat(e.target.value) })}
                min="0.5"
                step="0.5"
              />
            </div>
            <Button
              onClick={() => createMutation.mutate(newTask)}
              disabled={!newTask.title || createMutation.isPending}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}