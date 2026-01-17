import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, CheckCircle, Award } from 'lucide-react';

export default function ForumAnswer({ answer, onVote, isAccepted }) {
  return (
    <Card className={`bg-[#1a0f2e] border-[#2d1e50] ${isAccepted ? 'border-emerald-500' : ''}`}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => onVote({ targetId: answer.id, voteType: 'upvote', targetType: 'answer' })}
              className="text-gray-400 hover:text-[#8b85f7]"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <span className="text-lg font-semibold text-white">{answer.upvote_count || 0}</span>
            <button 
              onClick={() => onVote({ targetId: answer.id, voteType: 'downvote', targetType: 'answer' })}
              className="text-gray-400 hover:text-red-500"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            {isAccepted && (
              <CheckCircle className="w-6 h-6 text-emerald-500 mt-2" />
            )}
          </div>

          <div className="flex-1">
            {isAccepted && (
              <Badge className="bg-emerald-500 text-white mb-3">
                <CheckCircle className="w-3 h-3 mr-1" />
                Accepted Answer
              </Badge>
            )}

            <p className="text-gray-300 mb-4 whitespace-pre-wrap">{answer.content}</p>

            <div className="flex items-center gap-3 text-sm text-gray-500">
              {answer.is_mentor && (
                <Badge className="bg-violet-500 text-white">
                  <Award className="w-3 h-3 mr-1" />
                  Mentor
                </Badge>
              )}
              <span>
                {answer.author_name} • {new Date(answer.created_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}