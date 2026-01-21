import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Target } from 'lucide-react';

export default function ProgressTracker({ title, goals, icon: Icon = Target }) {
  return (
    <Card className="card-dark">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gradient">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal, index) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            const isComplete = progress >= 100;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500" />
                    )}
                    <span className="text-white font-medium">{goal.label}</span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {goal.current} / {goal.target}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                {goal.reward && !isComplete && (
                  <p className="text-xs text-[#8b85f7]">
                    Reward: {goal.reward}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}