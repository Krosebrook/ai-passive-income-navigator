import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Target, Sparkles } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const CATEGORIES = [
  'digital_products',
  'content_creation',
  'saas',
  'ecommerce',
  'real_estate',
  'investments'
];

export default function FirstGoalStep({ onNext }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('digital_products');

  const createIdeaMutation = useMutation({
    mutationFn: (data) => base44.entities.PortfolioIdea.create(data),
    onSuccess: () => {
      toast.success('First portfolio idea created!');
    }
  });

  const handleNext = async () => {
    if (title) {
      await createIdeaMutation.mutateAsync({
        title,
        description,
        category,
        status: 'exploring',
        priority: 'high',
        is_generated: false
      });
    }
    
    onNext({ first_goal_created: !!title });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center glow-primary mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Set Your First Goal</h2>
        <p className="text-gray-400">What's the first idea you want to explore?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-white mb-2 block">
            Idea Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., AI-Powered Newsletter, Rental Property, E-commerce Store"
            className="bg-[#1a0f2e] border-[#2d1e50] text-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-2 block">
            Category
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-[#1a0f2e] border-[#2d1e50] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-2 block">
            Description (optional)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your idea..."
            rows={3}
            className="bg-[#1a0f2e] border-[#2d1e50] text-white"
          />
        </div>

        <div className="bg-[#8b85f7]/10 rounded-lg p-4 border border-[#8b85f7]/30">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#8b85f7] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white mb-1">Pro Tip</p>
              <p className="text-xs text-gray-400">
                Don't worry about getting it perfect! You can always refine your idea later or let our AI suggest improvements.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => onNext({ first_goal_created: false })}
          className="border-[#2d1e50] text-gray-400 hover:text-white"
        >
          Skip for Now
        </Button>
        <Button
          onClick={handleNext}
          disabled={!title}
          className="flex-1 bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] hover:from-[#9a95ff] hover:to-[#00d4ff]"
          size="lg"
        >
          {title ? 'Create & Continue' : 'Skip'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}