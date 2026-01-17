import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Zap, Plus, Trash2, Power, PowerOff, CheckCircle } from 'lucide-react';

const STAGE_OPTIONS = [
  { value: 'research', label: 'Research' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'launch', label: 'Launch' },
  { value: 'completed', label: 'Completed' }
];

const ACTION_TYPES = [
  { value: 'create_task', label: 'Create Task' },
  { value: 'create_reminder', label: 'Create Reminder' },
  { value: 'update_priority', label: 'Update Priority' },
  { value: 'send_notification', label: 'Send Email Notification' }
];

const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

export default function AutomationRulesManager() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRule, setNewRule] = useState({
    rule_name: '',
    trigger_stage: 'analysis',
    is_active: true,
    actions: []
  });
  const [currentAction, setCurrentAction] = useState({
    action_type: 'create_task',
    config: {}
  });

  const { data: rules = [] } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: () => base44.entities.PipelineAutomationRule.list('-created_date')
  });

  const createRuleMutation = useMutation({
    mutationFn: (rule) => base44.entities.PipelineAutomationRule.create(rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      setShowCreateModal(false);
      setNewRule({ rule_name: '', trigger_stage: 'analysis', is_active: true, actions: [] });
      toast.success('Automation rule created');
    }
  });

  const toggleRuleMutation = useMutation({
    mutationFn: ({ id, is_active }) => 
      base44.entities.PipelineAutomationRule.update(id, { is_active: !is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Rule updated');
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id) => base44.entities.PipelineAutomationRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Rule deleted');
    }
  });

  const addAction = () => {
    if (!currentAction.action_type) return;
    
    setNewRule({
      ...newRule,
      actions: [...newRule.actions, { ...currentAction }]
    });
    setCurrentAction({ action_type: 'create_task', config: {} });
  };

  const removeAction = (index) => {
    setNewRule({
      ...newRule,
      actions: newRule.actions.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Automation Rules
        </h3>
        <Button onClick={() => setShowCreateModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Rule
        </Button>
      </div>

      <div className="grid gap-3">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{rule.rule_name}</h4>
                    <Badge variant="outline">
                      {STAGE_OPTIONS.find(s => s.value === rule.trigger_stage)?.label}
                    </Badge>
                    {rule.is_active ? (
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {rule.actions?.length || 0} action(s) configured
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRuleMutation.mutate({ 
                      id: rule.id, 
                      is_active: rule.is_active 
                    })}
                  >
                    {rule.is_active ? (
                      <Power className="w-4 h-4 text-green-600" />
                    ) : (
                      <PowerOff className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRuleMutation.mutate(rule.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Rule Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Automation Rule</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rule Name</label>
              <Input
                value={newRule.rule_name}
                onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
                placeholder="e.g., Auto-create analysis tasks"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Trigger Stage</label>
              <Select
                value={newRule.trigger_stage}
                onValueChange={(value) => setNewRule({ ...newRule, trigger_stage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div>
              <label className="text-sm font-medium mb-2 block">Actions</label>
              
              {/* Existing Actions */}
              {newRule.actions.map((action, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">
                      {ACTION_TYPES.find(t => t.value === action.action_type)?.label}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAction(idx)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}

              {/* Add New Action */}
              <Card className="mt-3">
                <CardContent className="pt-4 space-y-3">
                  <Select
                    value={currentAction.action_type}
                    onValueChange={(value) => setCurrentAction({ 
                      action_type: value, 
                      config: {} 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Action-specific config */}
                  {currentAction.action_type === 'create_task' && (
                    <>
                      <Input
                        placeholder="Task Title"
                        value={currentAction.config.task_title || ''}
                        onChange={(e) => setCurrentAction({
                          ...currentAction,
                          config: { ...currentAction.config, task_title: e.target.value }
                        })}
                      />
                      <Textarea
                        placeholder="Task Description"
                        value={currentAction.config.task_description || ''}
                        onChange={(e) => setCurrentAction({
                          ...currentAction,
                          config: { ...currentAction.config, task_description: e.target.value }
                        })}
                        rows={2}
                      />
                      <Select
                        value={currentAction.config.task_priority || 'medium'}
                        onValueChange={(value) => setCurrentAction({
                          ...currentAction,
                          config: { ...currentAction.config, task_priority: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}

                  {currentAction.action_type === 'create_reminder' && (
                    <>
                      <Input
                        type="number"
                        placeholder="Days from now"
                        value={currentAction.config.reminder_days_offset || ''}
                        onChange={(e) => setCurrentAction({
                          ...currentAction,
                          config: { ...currentAction.config, reminder_days_offset: Number(e.target.value) }
                        })}
                      />
                      <Textarea
                        placeholder="Reminder Message"
                        value={currentAction.config.reminder_message || ''}
                        onChange={(e) => setCurrentAction({
                          ...currentAction,
                          config: { ...currentAction.config, reminder_message: e.target.value }
                        })}
                        rows={2}
                      />
                    </>
                  )}

                  {currentAction.action_type === 'update_priority' && (
                    <Select
                      value={currentAction.config.new_priority || 'high'}
                      onValueChange={(value) => setCurrentAction({
                        ...currentAction,
                        config: { ...currentAction.config, new_priority: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {currentAction.action_type === 'send_notification' && (
                    <Textarea
                      placeholder="Notification Message"
                      value={currentAction.config.notification_message || ''}
                      onChange={(e) => setCurrentAction({
                        ...currentAction,
                        config: { ...currentAction.config, notification_message: e.target.value }
                      })}
                      rows={3}
                    />
                  )}

                  <Button onClick={addAction} size="sm" className="w-full">
                    <Plus className="w-3 h-3 mr-2" />
                    Add Action
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={() => createRuleMutation.mutate(newRule)}
              disabled={!newRule.rule_name || newRule.actions.length === 0}
              className="w-full"
            >
              Create Automation Rule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}