import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Users, Plus, UserPlus, Crown, Shield } from 'lucide-react';

export default function InvestmentGroups() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [user, setUser] = useState(null);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    is_private: false
  });

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: groups = [] } = useQuery({
    queryKey: ['investment-groups'],
    queryFn: () => base44.entities.InvestmentGroup.list('-created_date')
  });

  const myGroups = groups.filter(g => 
    g.creator_email === user?.email || 
    g.members?.some(m => m.email === user?.email)
  );

  const createGroupMutation = useMutation({
    mutationFn: (groupData) => base44.entities.InvestmentGroup.create({
      ...groupData,
      creator_email: user?.email,
      members: [{
        email: user?.email,
        name: user?.full_name,
        role: 'owner',
        joined_date: new Date().toISOString()
      }],
      member_count: 1
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-groups'] });
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', is_private: false });
      toast.success('Investment group created!');
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Investment Groups</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {myGroups.map((group) => {
          const userMember = group.members?.find(m => m.email === user?.email);
          return (
            <Card key={group.id} className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-white">{group.name}</span>
                  {userMember?.role === 'owner' && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-400">{group.description}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-white">
                    <Users className="w-3 h-3 mr-1" />
                    {group.member_count} members
                  </Badge>
                  {group.is_private && (
                    <Badge className="bg-purple-600 text-white">Private</Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <UserPlus className="w-3 h-3 mr-2" />
                  Invite Members
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Group Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Investment Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Group Name</label>
              <Input
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="e.g., SaaS Investors"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="What is this group about?"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="private"
                checked={newGroup.is_private}
                onChange={(e) => setNewGroup({ ...newGroup, is_private: e.target.checked })}
              />
              <label htmlFor="private" className="text-sm">
                Make this group private (invite-only)
              </label>
            </div>
            <Button 
              onClick={() => createGroupMutation.mutate(newGroup)}
              disabled={!newGroup.name}
              className="w-full"
            >
              Create Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}