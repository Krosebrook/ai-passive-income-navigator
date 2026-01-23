import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import confetti from 'canvas-confetti';
import { 
  Trophy, Star, Zap, Target, BookOpen, 
  Award, CheckCircle2, Lock, Play
} from 'lucide-react';
import { toast } from 'sonner';

const ONBOARDING_QUESTS = [
  {
    id: 'profile_setup',
    title: 'Set Up Your Profile',
    description: 'Tell us about your investment goals',
    points: 50,
    badge: 'First Steps',
    icon: Trophy,
    tasks: [
      { id: 'risk_profile', name: 'Complete risk assessment', points: 20 },
      { id: 'goals', name: 'Set investment goals', points: 15 },
      { id: 'preferences', name: 'Choose preferences', points: 15 }
    ]
  },
  {
    id: 'first_deal',
    title: 'Explore Your First Deal',
    description: 'Learn how to evaluate opportunities',
    points: 100,
    badge: 'Deal Hunter',
    icon: Zap,
    requires: 'profile_setup',
    tasks: [
      { id: 'view_deal', name: 'View a deal opportunity', points: 30 },
      { id: 'analyze_deal', name: 'Run AI analysis', points: 40 },
      { id: 'save_deal', name: 'Save to watchlist', points: 30 }
    ]
  },
  {
    id: 'portfolio_start',
    title: 'Build Your Portfolio',
    description: 'Create your investment strategy',
    points: 150,
    badge: 'Portfolio Builder',
    icon: Target,
    requires: 'first_deal',
    tasks: [
      { id: 'add_investment', name: 'Add first investment', points: 50 },
      { id: 'set_allocation', name: 'Define asset allocation', points: 50 },
      { id: 'review_strategy', name: 'Review AI recommendations', points: 50 }
    ]
  },
  {
    id: 'community_join',
    title: 'Join the Community',
    description: 'Connect with other investors',
    points: 75,
    badge: 'Community Member',
    icon: BookOpen,
    requires: 'portfolio_start',
    tasks: [
      { id: 'view_group', name: 'Explore investment groups', points: 25 },
      { id: 'subscribe_watchlist', name: 'Follow a watchlist', points: 25 },
      { id: 'rate_content', name: 'Rate expert content', points: 25 }
    ]
  },
  {
    id: 'master_investor',
    title: 'Master Investor',
    description: 'Complete all advanced features',
    points: 200,
    badge: 'Investment Master',
    icon: Award,
    requires: 'community_join',
    tasks: [
      { id: 'run_scenario', name: 'Run what-if scenario', points: 70 },
      { id: 'risk_analysis', name: 'Complete risk analysis', points: 70 },
      { id: 'set_goal', name: 'Set financial goal', points: 60 }
    ]
  }
];

export default function GamifiedOnboarding({ isOpen, onClose }) {
  const [progress, setProgress] = useState({
    completedQuests: [],
    completedTasks: {},
    totalPoints: 0,
    currentQuest: null
  });
  const [showTutorial, setShowTutorial] = useState(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const user = await base44.auth.me();
      const onboardingState = await base44.entities.OnboardingState.filter({
        user_email: user.email
      });
      
      if (onboardingState.length > 0) {
        const state = onboardingState[0];
        setProgress({
          completedQuests: state.completed_steps?.map(s => s.step_id) || [],
          completedTasks: state.completed_steps?.reduce((acc, s) => {
            acc[s.step_id] = true;
            return acc;
          }, {}) || {},
          totalPoints: state.engagement_metrics?.total_points || 0,
          currentQuest: state.activation_status === 'in_progress' ? 
            ONBOARDING_QUESTS[0].id : null
        });
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const completeTask = async (questId, taskId, points) => {
    const newProgress = {
      ...progress,
      completedTasks: { ...progress.completedTasks, [`${questId}_${taskId}`]: true },
      totalPoints: progress.totalPoints + points
    };
    setProgress(newProgress);
    
    // Check if quest is complete
    const quest = ONBOARDING_QUESTS.find(q => q.id === questId);
    const allTasksComplete = quest.tasks.every(t => 
      newProgress.completedTasks[`${questId}_${t.id}`]
    );
    
    if (allTasksComplete && !progress.completedQuests.includes(questId)) {
      completeQuest(questId, quest.points);
    }
    
    toast.success(`+${points} points!`);
  };

  const completeQuest = async (questId, points) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    const quest = ONBOARDING_QUESTS.find(q => q.id === questId);
    
    setProgress({
      ...progress,
      completedQuests: [...progress.completedQuests, questId],
      totalPoints: progress.totalPoints + points
    });
    
    // Award badge
    await base44.functions.invoke('awardPoints', {
      event_type: 'milestone_reached',
      points: points,
      description: `Completed quest: ${quest.title}`
    });
    
    toast.success(`🎉 Quest Complete: ${quest.title}!`, { duration: 5000 });
  };

  const isQuestUnlocked = (quest) => {
    if (!quest.requires) return true;
    return progress.completedQuests.includes(quest.requires);
  };

  const getQuestProgress = (quest) => {
    const completed = quest.tasks.filter(t => 
      progress.completedTasks[`${quest.id}_${t.id}`]
    ).length;
    return (completed / quest.tasks.length) * 100;
  };

  const totalProgress = (progress.completedQuests.length / ONBOARDING_QUESTS.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-[#1a0f2e] border-[#2d1e50] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] bg-clip-text text-transparent">
                Investment Journey
              </h2>
              <p className="text-gray-400 mt-1">Complete quests to master the platform</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gradient">
                {progress.totalPoints}
              </div>
              <p className="text-xs text-gray-400">Total Points</p>
            </div>
          </div>

          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Overall Progress</span>
              <span className="text-sm text-white font-medium">{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-3" />
          </div>
        </div>

        {/* Quest Log */}
        <div className="space-y-4 mt-6">
          {ONBOARDING_QUESTS.map((quest) => {
            const Icon = quest.icon;
            const isUnlocked = isQuestUnlocked(quest);
            const isComplete = progress.completedQuests.includes(quest.id);
            const questProgress = getQuestProgress(quest);

            return (
              <Card key={quest.id} className={`${
                isComplete ? 'bg-green-500/10 border-green-500/30' :
                isUnlocked ? 'bg-[#0f0618] border-[#2d1e50]' :
                'bg-[#0f0618] border-gray-700 opacity-50'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isComplete ? 'bg-green-500' :
                      isUnlocked ? 'bg-gradient-to-br from-[#8b85f7] to-[#00b7eb]' :
                      'bg-gray-700'
                    }`}>
                      {isComplete ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : isUnlocked ? (
                        <Icon className="w-6 h-6 text-white" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{quest.title}</h3>
                          <p className="text-sm text-gray-400">{quest.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-500/20 text-yellow-500">
                            <Star className="w-3 h-3 mr-1" />
                            {quest.points} pts
                          </Badge>
                          {isComplete && (
                            <Badge className="bg-purple-500/20 text-purple-500">
                              {quest.badge}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {isUnlocked && !isComplete && (
                        <>
                          <Progress value={questProgress} className="h-2 mb-3" />
                          <div className="space-y-2">
                            {quest.tasks.map((task) => {
                              const isTaskComplete = progress.completedTasks[`${quest.id}_${task.id}`];
                              return (
                                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-[#1a0f2e]">
                                  <div className="flex items-center gap-2">
                                    {isTaskComplete ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
                                    )}
                                    <span className={`text-sm ${isTaskComplete ? 'text-gray-500 line-through' : 'text-white'}`}>
                                      {task.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">+{task.points}</span>
                                    {!isTaskComplete && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="h-6 text-xs"
                                        onClick={() => completeTask(quest.id, task.id, task.points)}
                                      >
                                        <Play className="w-3 h-3 mr-1" />
                                        Start
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}

                      {!isUnlocked && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                          <Lock className="w-4 h-4" />
                          Complete previous quest to unlock
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}