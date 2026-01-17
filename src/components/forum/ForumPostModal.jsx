import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function ForumPostModal({ open, onClose, user }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await base44.entities.ForumPost.create({
        ...formData,
        author_name: user?.full_name || 'Anonymous',
        author_email: user?.email || '',
        is_question: true
      });

      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      toast.success('Question posted!');
      onClose();
      setFormData({ title: '', content: '', category: 'general' });
    } catch (error) {
      toast.error('Failed to post question');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ask a Question</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What's your question?"
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="getting_started">Getting Started</SelectItem>
                <SelectItem value="monetization">Monetization</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="tech_tools">Tech & Tools</SelectItem>
                <SelectItem value="success_stories">Success Stories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Question Details</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Provide more details about your question..."
              rows={8}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSubmit} className="flex-1">Post Question</Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}