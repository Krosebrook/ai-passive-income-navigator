import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    Plus, Trash2, Sparkles, Calendar, Mail, Bell, 
    CheckCircle2, Loader2, Copy, Edit2 
} from 'lucide-react';
import { toast } from 'sonner';

const ACTION_TYPES = [
    { value: 'email', label: 'Send Email', icon: Mail },
    { value: 'reminder', label: 'Set Reminder', icon: Bell },
    { value: 'task', label: 'Create Task', icon: CheckCircle2 },
    { value: 'research', label: 'Research', icon: Sparkles },
    { value: 'call', label: 'Schedule Call', icon: Calendar }
];

const WORKFLOW_STAGES = [
    'initial_contact',
    'follow_up',
    'evaluation',
    'negotiation',
    'closing'
];

export default function WorkflowBuilder({ dealId, existingWorkflow }) {
    const queryClient = useQueryClient();
    const [selectedStage, setSelectedStage] = useState(existingWorkflow?.workflow_stage || 'initial_contact');
    const [actions, setActions] = useState(existingWorkflow?.scheduled_actions || []);
    const [showAISuggestions, setShowAISuggestions] = useState(false);

    // Fetch existing workflow
    const { data: workflow } = useQuery({
        queryKey: ['workflow', dealId],
        queryFn: async () => {
            const workflows = await base44.entities.DealNurturingWorkflow.filter({ deal_id: dealId });
            return workflows[0];
        },
        enabled: !!dealId
    });

    // AI Suggestions
    const { data: aiSuggestions, isLoading: loadingAI, refetch: fetchAISuggestions } = useQuery({
        queryKey: ['workflow-suggestions', dealId],
        queryFn: async () => {
            const response = await base44.functions.invoke('suggestDealWorkflow', { dealId });
            return response.data;
        },
        enabled: false
    });

    // Save workflow mutation
    const saveWorkflowMutation = useMutation({
        mutationFn: async (workflowData) => {
            if (workflow?.id) {
                return await base44.entities.DealNurturingWorkflow.update(workflow.id, workflowData);
            } else {
                return await base44.entities.DealNurturingWorkflow.create({
                    deal_id: dealId,
                    ...workflowData
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflow', dealId] });
            toast.success('Workflow saved successfully');
        }
    });

    const addAction = () => {
        setActions([...actions, {
            action_type: 'email',
            action_date: new Date().toISOString().split('T')[0],
            action_description: '',
            completed: false
        }]);
    };

    const updateAction = (index, field, value) => {
        const updated = [...actions];
        updated[index][field] = value;
        setActions(updated);
    };

    const removeAction = (index) => {
        setActions(actions.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        saveWorkflowMutation.mutate({
            workflow_stage: selectedStage,
            scheduled_actions: actions,
            ai_recommended_actions: aiSuggestions?.workflow?.immediate_next_steps || []
        });
    };

    const applyAISuggestion = (stageData) => {
        const newActions = stageData.actions.map(action => ({
            action_type: action.action_type,
            action_date: calculateDateFromTiming(action.relative_timing),
            action_description: action.action_description,
            email_template: action.email_template,
            completed: false
        }));
        setActions(newActions);
        toast.success('AI suggestions applied');
    };

    const calculateDateFromTiming = (timing) => {
        const now = new Date();
        if (timing.includes('24h')) {
            now.setDate(now.getDate() + 1);
        } else if (timing.includes('day_3')) {
            now.setDate(now.getDate() + 3);
        } else if (timing.includes('week_1')) {
            now.setDate(now.getDate() + 7);
        } else if (timing.includes('week_2')) {
            now.setDate(now.getDate() + 14);
        } else {
            now.setDate(now.getDate() + 1);
        }
        return now.toISOString().split('T')[0];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Automated Nurturing Workflow</h3>
                    <p className="text-sm text-gray-600">Define triggers and actions to automate deal follow-ups</p>
                </div>
                <Button
                    onClick={() => {
                        setShowAISuggestions(true);
                        fetchAISuggestions();
                    }}
                    className="gap-2"
                    variant="outline"
                >
                    <Sparkles className="w-4 h-4" />
                    AI Suggestions
                </Button>
            </div>

            {/* Stage Selector */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Current Workflow Stage</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={selectedStage} onValueChange={setSelectedStage}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {WORKFLOW_STAGES.map(stage => (
                                <SelectItem key={stage} value={stage}>
                                    {stage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Actions Builder */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Scheduled Actions</CardTitle>
                        <Button onClick={addAction} size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Action
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {actions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No actions defined yet. Add an action or use AI suggestions.</p>
                        </div>
                    ) : (
                        actions.map((action, index) => (
                            <ActionBuilder
                                key={index}
                                action={action}
                                index={index}
                                onUpdate={updateAction}
                                onRemove={removeAction}
                            />
                        ))
                    )}
                </CardContent>
            </Card>

            {/* AI Suggestions Panel */}
            {showAISuggestions && (
                <Card className="border-violet-200 bg-violet-50">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-600" />
                            AI-Powered Workflow Suggestions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingAI ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                                <span className="ml-2 text-gray-600">Analyzing deal and generating workflow...</span>
                            </div>
                        ) : aiSuggestions?.workflow ? (
                            <div className="space-y-4">
                                {/* Immediate Next Steps */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Immediate Next Steps:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                        {aiSuggestions.workflow.immediate_next_steps?.map((step, i) => (
                                            <li key={i}>{step}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Suggested Workflow by Stage */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Suggested Workflows by Stage:</h4>
                                    <div className="space-y-3">
                                        {aiSuggestions.workflow.workflow_stages?.map((stageData, i) => (
                                            <div key={i} className="p-3 bg-white rounded-lg border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <h5 className="font-medium text-gray-900">
                                                            {stageData.stage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                                        </h5>
                                                        <p className="text-xs text-gray-600">{stageData.description}</p>
                                                    </div>
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedStage(stageData.stage);
                                                            applyAISuggestion(stageData);
                                                        }}
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        Apply
                                                    </Button>
                                                </div>
                                                <div className="text-xs text-gray-600 space-y-1">
                                                    {stageData.actions?.slice(0, 2).map((action, j) => (
                                                        <div key={j} className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                {action.action_type}
                                                            </Badge>
                                                            <span>{action.action_description}</span>
                                                        </div>
                                                    ))}
                                                    {stageData.actions?.length > 2 && (
                                                        <p className="text-gray-500">+{stageData.actions.length - 2} more actions</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Content Suggestions */}
                                {aiSuggestions.workflow.content_suggestions && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Content Suggestions:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                            {aiSuggestions.workflow.content_suggestions.map((suggestion, i) => (
                                                <li key={i}>{suggestion}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-600">No suggestions available</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <Button
                    onClick={handleSave}
                    disabled={saveWorkflowMutation.isPending}
                    className="gap-2"
                >
                    {saveWorkflowMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Workflow'
                    )}
                </Button>
            </div>
        </div>
    );
}

function ActionBuilder({ action, index, onUpdate, onRemove }) {
    const [showEmailTemplate, setShowEmailTemplate] = useState(false);
    const ActionIcon = ACTION_TYPES.find(t => t.value === action.action_type)?.icon || Mail;

    return (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
            <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Action Type */}
                    <Select
                        value={action.action_type}
                        onValueChange={(value) => onUpdate(index, 'action_type', value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ACTION_TYPES.map(type => {
                                const Icon = type.icon;
                                return (
                                    <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4" />
                                            {type.label}
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>

                    {/* Action Date */}
                    <Input
                        type="date"
                        value={action.action_date}
                        onChange={(e) => onUpdate(index, 'action_date', e.target.value)}
                    />

                    {/* Remove Button */}
                    <Button
                        onClick={() => onRemove(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Action Description */}
            <Textarea
                placeholder="Describe the action to be taken..."
                value={action.action_description}
                onChange={(e) => onUpdate(index, 'action_description', e.target.value)}
                rows={2}
            />

            {/* Email Template (if action type is email) */}
            {action.action_type === 'email' && (
                <div>
                    <Button
                        onClick={() => setShowEmailTemplate(!showEmailTemplate)}
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-xs"
                    >
                        <Edit2 className="w-3 h-3" />
                        {showEmailTemplate ? 'Hide' : 'Show'} Email Template
                    </Button>
                    {showEmailTemplate && (
                        <Textarea
                            placeholder="Email template (optional)..."
                            value={action.email_template || ''}
                            onChange={(e) => onUpdate(index, 'email_template', e.target.value)}
                            rows={4}
                            className="mt-2"
                        />
                    )}
                </div>
            )}
        </div>
    );
}