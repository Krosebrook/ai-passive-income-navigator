import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Users, Mail, Sparkles, Loader2, TrendingUp } from 'lucide-react';

export default function CollaborationSuggestions() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const analyzeSuggestions = async () => {
    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('suggestCollaborators', {});
      setSuggestions(response.data.suggestions || []);
      toast.success('Found potential collaborators!');
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      toast.error('Failed to analyze collaborators');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInviteToGroup = (userEmail) => {
    toast.success(`Invitation feature coming soon for ${userEmail}`);
  };

  return (
    <Card className="bg-[#1a0f2e] border-[#2d1e50]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-violet-500" />
            AI Collaboration Suggestions
          </CardTitle>
          <Button 
            onClick={analyzeSuggestions}
            disabled={isAnalyzing}
            size="sm"
            className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Find Collaborators
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 && !isAnalyzing && (
          <div className="text-center py-8 text-gray-400">
            Click "Find Collaborators" to discover users with similar investment interests
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-400">AI is analyzing user profiles and preferences...</p>
          </div>
        )}

        <div className="space-y-3">
          {suggestions.map((suggestion, idx) => (
            <Card key={idx} className="bg-[#0f0618] border-[#2d1e50]">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-white">{suggestion.user_name}</h4>
                      <Badge className="bg-violet-600 text-white">
                        {suggestion.match_score}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{suggestion.match_reason}</p>
                  </div>
                </div>

                {suggestion.collaboration_opportunities?.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-xs font-semibold text-white mb-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Collaboration Opportunities
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {suggestion.collaboration_opportunities.map((opp, i) => (
                        <Badge key={i} variant="outline" className="text-xs text-violet-400 border-violet-400">
                          {opp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {suggestion.complementary_aspects?.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-xs font-semibold text-white mb-2">Complementary Skills</h5>
                    <ul className="space-y-1">
                      {suggestion.complementary_aspects.map((aspect, i) => (
                        <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                          <span className="text-violet-500">•</span>
                          {aspect}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-700">
                  <Button 
                    size="sm" 
                    onClick={() => handleInviteToGroup(suggestion.user_email)}
                    className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    Invite to Group
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.location.href = `mailto:${suggestion.user_email}`}
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}