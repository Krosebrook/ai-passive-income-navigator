import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles, Copy, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700'
};

export default function ResourceModal({ resource, open, onClose }) {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (open && resource) {
      // Increment view count
      base44.entities.Resource.update(resource.id, {
        views_count: (resource.views_count || 0) + 1
      });
    }
  }, [open, resource]);

  const copyContent = () => {
    navigator.clipboard.writeText(resource.content);
    setCopied(true);
    toast.success('Content copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!resource) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-3">{resource.title}</DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={DIFFICULTY_COLORS[resource.difficulty]}>
                  {resource.difficulty}
                </Badge>
                <Badge variant="secondary">
                  {resource.type.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">
                  {resource.category.replace('_', ' ')}
                </Badge>
                {resource.is_ai_generated && (
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Generated
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyContent}
              className="flex-shrink-0"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 pb-4 border-b">
            <Clock className="w-4 h-4" />
            <span>{resource.estimated_time || '10 minutes'} read</span>
            {resource.views_count > 0 && (
              <>
                <span>•</span>
                <span>{resource.views_count} views</span>
              </>
            )}
          </div>

          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {resource.tags.map(tag => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4">{children}</h3>,
                p: ({ children }) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                li: ({ children }) => <li className="text-gray-700">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-violet-500 pl-4 italic text-gray-600 my-4">
                    {children}
                  </blockquote>
                ),
                code: ({ inline, children }) => inline ? (
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-violet-600">
                    {children}
                  </code>
                ) : (
                  <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto">
                    {children}
                  </code>
                )
              }}
            >
              {resource.content}
            </ReactMarkdown>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}