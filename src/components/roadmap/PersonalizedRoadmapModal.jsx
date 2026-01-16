import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Route, Clock, DollarSign, Target, CheckCircle2, 
  Circle, Loader2, AlertTriangle, TrendingUp 
} from 'lucide-react';

/**
 * Personalized AI Roadmap Modal
 * Generates and displays tailored step-by-step action plans
 */
export default function PersonalizedRoadmapModal({ open, onClose, idea }) {
  const [step, setStep] = useState('profile'); // profile | generating | roadmap
  const [userProfile, setUserProfile] = useState({
    skills: [],
    available_hours_weekly: 10,
    budget: 1000,
    risk_tolerance: 'medium',
    experience_level: 'beginner'
  });
  const [skillInput, setSkillInput] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const addSkill = () => {
    if (skillInput.trim() && !userProfile.skills.includes(skillInput.trim())) {
      setUserProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setUserProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const generateRoadmap = async () => {
    setIsGenerating(true);
    setStep('generating');

    try {
      const response = await base44.functions.invoke('generatePersonalizedRoadmap', {
        portfolioIdeaId: idea.id,
        ideaTitle: idea.title,
        ideaDescription: idea.description,
        userProfile
      });

      setRoadmap(response.data);
      setStep('roadmap');
      toast.success('Personalized roadmap generated!');
    } catch (error) {
      console.error('Roadmap generation failed:', error);
      toast.error('Failed to generate roadmap');
      setStep('profile');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateStepCompletion = async (phaseIndex, stepIndex, completed) => {
    const updatedRoadmap = { ...roadmap };
    updatedRoadmap.phases[phaseIndex].action_steps[stepIndex].completed = completed;

    // Calculate progress
    const totalSteps = updatedRoadmap.phases.reduce(
      (acc, phase) => acc + phase.action_steps.length, 0
    );
    const completedSteps = updatedRoadmap.phases.reduce(
      (acc, phase) => acc + phase.action_steps.filter(s => s.completed).length, 0
    );
    updatedRoadmap.progress_percentage = Math.round((completedSteps / totalSteps) * 100);

    try {
      await base44.entities.PersonalizedRoadmap.update(roadmap.id, updatedRoadmap);
      setRoadmap(updatedRoadmap);
      toast.success(completed ? 'Step completed!' : 'Step marked incomplete');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update progress');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-violet-600" />
            Personalized AI Roadmap: {idea?.title}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: User Profile */}
        {step === 'profile' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Tell us about yourself so we can create a personalized action plan
            </p>

            <div>
              <Label>Your Skills</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="e.g., Marketing, Design, Coding"
                />
                <Button onClick={addSkill} size="icon">+</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {userProfile.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="cursor-pointer" 
                    onClick={() => removeSkill(skill)}>
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Available Time (hours/week)</Label>
                <Input
                  type="number"
                  value={userProfile.available_hours_weekly}
                  onChange={(e) => setUserProfile(prev => ({ 
                    ...prev, available_hours_weekly: parseInt(e.target.value) 
                  }))}
                  min="1"
                  max="40"
                />
              </div>

              <div>
                <Label>Starting Budget ($)</Label>
                <Input
                  type="number"
                  value={userProfile.budget}
                  onChange={(e) => setUserProfile(prev => ({ 
                    ...prev, budget: parseInt(e.target.value) 
                  }))}
                  min="0"
                />
              </div>

              <div>
                <Label>Risk Tolerance</Label>
                <Select
                  value={userProfile.risk_tolerance}
                  onValueChange={(value) => setUserProfile(prev => ({ 
                    ...prev, risk_tolerance: value 
                  }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Safe & Steady</SelectItem>
                    <SelectItem value="medium">Medium - Balanced</SelectItem>
                    <SelectItem value="high">High - Aggressive Growth</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Experience Level</Label>
                <Select
                  value={userProfile.experience_level}
                  onValueChange={(value) => setUserProfile(prev => ({ 
                    ...prev, experience_level: value 
                  }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={generateRoadmap} className="w-full">
              Generate My Personalized Roadmap
            </Button>
          </div>
        )}

        {/* Step 2: Generating */}
        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Creating Your Personalized Roadmap...
            </p>
            <p className="text-sm text-gray-600">
              Analyzing your profile and tailoring a plan just for you
            </p>
          </div>
        )}

        {/* Step 3: Roadmap Display */}
        {step === 'roadmap' && roadmap && (
          <div className="space-y-6">
            {/* Overview */}
            <Card className="bg-gradient-to-r from-violet-50 to-blue-50 border-violet-200">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-violet-600" />
                    <div>
                      <p className="text-sm text-gray-600">Timeline</p>
                      <p className="text-lg font-bold">{roadmap.total_timeline_weeks} weeks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Investment</p>
                      <p className="text-lg font-bold">${roadmap.estimated_total_investment}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-emerald-600" />
                    <div>
                      <p className="text-sm text-gray-600">Progress</p>
                      <p className="text-lg font-bold">{roadmap.progress_percentage || 0}%</p>
                    </div>
                  </div>
                </div>
                <Progress value={roadmap.progress_percentage || 0} className="mt-4" />
              </CardContent>
            </Card>

            {/* Phases */}
            <Tabs defaultValue="0">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${roadmap.phases.length}, 1fr)` }}>
                {roadmap.phases.map((phase, idx) => (
                  <TabsTrigger key={idx} value={idx.toString()}>
                    Phase {phase.phase_number}
                  </TabsTrigger>
                ))}
              </TabsList>

              {roadmap.phases.map((phase, phaseIdx) => (
                <TabsContent key={phaseIdx} value={phaseIdx.toString()} className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{phase.phase_name}</h3>
                    <p className="text-sm text-gray-600">{phase.duration_weeks} weeks</p>
                  </div>

                  {/* Objectives */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Objectives</h4>
                      <ul className="space-y-1">
                        {phase.objectives.map((obj, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <Target className="w-4 h-4 text-violet-600 mt-0.5" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Action Steps */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Action Steps</h4>
                    {phase.action_steps.map((step, stepIdx) => (
                      <Card key={stepIdx} className={step.completed ? 'opacity-60' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => updateStepCompletion(phaseIdx, stepIdx, !step.completed)}
                              className="mt-1"
                            >
                              {step.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            <div className="flex-1">
                              <p className={`font-medium ${step.completed ? 'line-through' : ''}`}>
                                {step.step}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                <Badge variant="outline">{step.estimated_hours}h</Badge>
                                <Badge variant="outline">${step.cost_estimate}</Badge>
                                <Badge className={
                                  step.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  step.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-blue-100 text-blue-700'
                                }>{step.priority}</Badge>
                              </div>
                              {step.tools_needed && step.tools_needed.length > 0 && (
                                <p className="text-xs text-gray-600 mt-2">
                                  Tools: {step.tools_needed.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Milestones */}
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        Milestones
                      </h4>
                      <ul className="space-y-1">
                        {phase.milestones.map((milestone, idx) => (
                          <li key={idx} className="text-sm text-gray-700">• {milestone}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>

            {/* Key Risks */}
            {roadmap.key_risks && roadmap.key_risks.length > 0 && (
              <Card className="border-amber-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Key Risks & Mitigation
                  </h4>
                  <div className="space-y-3">
                    {roadmap.key_risks.map((risk, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="font-medium text-gray-900">⚠️ {risk.risk}</p>
                        <p className="text-gray-600 mt-1">→ {risk.mitigation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}