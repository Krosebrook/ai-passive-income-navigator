import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar } from '@/components/ui/avatar';
import { 
  Users, Plus, TrendingUp, DollarSign, 
  MessageCircle, UserPlus, Crown
} from 'lucide-react';
import { toast } from 'sonner';

export default function InvestmentGroupsHub() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    investment_focus: [],
    is_public: true
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['investment-groups'],
    queryFn: async () => {
      const allGroups = await base44.entities.InvestmentGroup.filter({ status: 'active' });
      return allGroups.sort((a, b) => b.members.length - a.members.length);
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return await base44.entities.InvestmentGroup.create({
        ...data,
        founder_email: user.email,
        members: [{
          email: user.email,
          role: 'founder',
          joined_date: new Date().toISOString()
        }]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-groups'] });
      setShowCreateDialog(false);
      setNewGroup({ name: '', description: '', investment_focus: [], is_public: true });
      toast.success('Investment group created!');
    }
  });

  const joinMutation = useMutation({
    mutationFn: async (groupId) => {
      const group = await base44.entities.InvestmentGroup.get(groupId);
      const user = await base44.auth.me();
      
      if (!group.members.find(m => m.email === user.email)) {
        group.members.push({
          email: user.email,
          role: 'member',
          joined_date: new Date().toISOString()
        });
        await base44.entities.InvestmentGroup.update(groupId, { members: group.members });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-groups'] });
      toast.success('Joined group!');
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] bg-clip-text text-transparent">
            Investment Groups
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Collaborate and co-invest with like-minded investors
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <Card key={group.id} className="card-dark hover:border-[#8b85f7]/50 transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    {group.name}
                    {group.pooled_capital > 0 && (
                      <Badge className="bg-green-500/20 text-green-500">
                        <DollarSign className="w-3 h-3" />
                      </Badge>
                    )}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-300 line-clamp-3">{group.description}</p>

              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-gray-400">
                  <Users className="w-4 h-4" />
                  {group.members?.length || 0} members
                </span>
                {group.pooled_capital > 0 && (
                  <span className="flex items-center gap-1 text-green-500">
                    <TrendingUp className="w-4 h-4" />
                    ${group.pooled_capital.toLocaleString()}
                  </span>
                )}
              </div>

              {group.investment_focus && group.investment_focus.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {group.investment_focus.slice(0, 3).map((focus, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {focus}
                    </Badge>
                  ))}
                  {group.investment_focus.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{group.investment_focus.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="space-y-2 pt-2">
                <Button 
                  size="sm"
                  className="w-full bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]"
                  onClick={() => joinMutation.mutate(group.id)}
                >
                  <UserPlus className="w-3 h-3 mr-2" />
                  Join Group
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedGroup(group)}
                >
                  <MessageCircle className="w-3 h-3 mr-2" />
                  View Discussions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#1a0f2e] border-[#2d1e50]">
          <DialogHeader>
            <DialogTitle className="text-gradient">Create Investment Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Group Name"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            />
            <Textarea
              placeholder="Description and mission"
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              rows={4}
            />
            <Button 
              className="w-full btn-primary"
              onClick={() => createMutation.mutate(newGroup)}
              disabled={!newGroup.name || !newGroup.description}
            >
              <Crown className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}