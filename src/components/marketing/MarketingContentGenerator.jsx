import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

/**
 * AI-powered marketing content generator component
 * 
 * Generates targeted marketing content for passive income ideas using AI.
 * Supports multiple content types: ad copy, social media, email campaigns, and blog outlines.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onClose - Callback when dialog closes
 * @param {Object} props.idea - Portfolio idea object
 * @param {string} props.idea.title - Idea title
 * @param {string} props.idea.description - Idea description
 * 
 * @example
 * <MarketingContentGenerator 
 *   open={isOpen} 
 *   onClose={() => setIsOpen(false)}
 *   idea={{ title: "AI Course", description: "..." }}
 * />
 */
export default function MarketingContentGenerator({ open, onClose, idea }) {
  const [contentType, setContentType] = useState('ads');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    targetAudience: ''
  });

  const handleGenerate = async () => {
    if (!formData.targetAudience?.trim()) {
      toast.error('Please describe your target audience');
      return;
    }

    if (formData.targetAudience.length < 10) {
      toast.error('Please provide a more detailed audience description (at least 10 characters)');
      return;
    }

    try {
      setIsLoading(true);
      setGeneratedContent(null);
      
      const response = await base44.functions.invoke('generateMarketingContent', {
        ideaTitle: idea?.title || 'Passive Income Idea',
        ideaDescription: idea?.description || '',
        targetAudience: formData.targetAudience.trim(),
        contentType
      });
      
      if (!response?.data) {
        throw new Error('No content generated');
      }
      
      setGeneratedContent(response.data);
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Content generation error:', error);
      toast.error(error.message || 'Failed to generate content. Please try again.');
      setGeneratedContent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    if (!text) {
      toast.error('No content to copy');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy. Please try manually.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Marketing Content Generator</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="results" disabled={!generatedContent}>Results</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Content Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'ads', label: '📢 Ad Copy', desc: 'Google & Facebook ads' },
                  { id: 'social', label: '📱 Social Media', desc: 'LinkedIn, Twitter, Instagram' },
                  { id: 'email', label: '✉️ Email Sequences', desc: 'Nurture campaigns' },
                  { id: 'blog', label: '📝 Blog Content', desc: 'SEO-optimized outlines' }
                ].map(option => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setContentType(option.id);
                      setGeneratedContent(null);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      contentType === option.id
                        ? 'border-violet-600 bg-violet-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-xs text-gray-600">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target Audience Description *</label>
              <Textarea
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g., Solo entrepreneurs, content creators, small business owners, or describe your ideal customer..."
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isLoading || !formData.targetAudience}
              className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Content...
                </>
              ) : (
                'Generate Content'
              )}
            </Button>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <AnimatePresence>
              {generatedContent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Ad Copy */}
                  {contentType === 'ads' && generatedContent.google_ads && (
                    <>
                      {/* Google Ads */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          Google Ads
                          <Badge>Search</Badge>
                        </h3>
                        <div className="space-y-3">
                          {generatedContent.google_ads.map((ad, idx) => (
                            <Card key={idx}>
                              <CardContent className="p-4 space-y-2">
                                <div>
                                  <p className="text-xs text-gray-600 font-medium">Headline</p>
                                  <p className="text-sm font-semibold text-gray-900">{ad.headline}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 font-medium">Description</p>
                                  <p className="text-sm text-gray-700">{ad.description}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 font-medium">CTA</p>
                                  <p className="text-sm text-violet-600 font-medium">{ad.cta}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(`${ad.headline}\n${ad.description}\n${ad.cta}`)}
                                  className="w-full mt-2 gap-2"
                                >
                                  <Copy className="w-4 h-4" />
                                  Copy
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Facebook Ads */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          Facebook Ads
                          <Badge variant="outline">Social</Badge>
                        </h3>
                        <div className="space-y-3">
                          {generatedContent.facebook_ads.map((ad, idx) => (
                            <Card key={idx} className="border-blue-200 bg-blue-50">
                              <CardContent className="p-4 space-y-2">
                                <div>
                                  <p className="text-xs text-gray-600 font-medium">Hook</p>
                                  <p className="text-sm font-semibold text-blue-900">{ad.hook}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 font-medium">Headline</p>
                                  <p className="text-sm font-semibold text-gray-900">{ad.headline}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 font-medium">Body</p>
                                  <p className="text-sm text-gray-700">{ad.body}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 font-medium">CTA Button</p>
                                  <Badge className="mt-1">{ad.cta_button}</Badge>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(`${ad.hook}\n${ad.headline}\n${ad.body}`)}
                                  className="w-full mt-2 gap-2"
                                >
                                  <Copy className="w-4 h-4" />
                                  Copy
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Social Media */}
                  {contentType === 'social' && (
                    <>
                      {/* LinkedIn */}
                      {generatedContent.linkedin_posts && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">LinkedIn Posts</h3>
                          <div className="space-y-3">
                            {generatedContent.linkedin_posts.map((post, idx) => (
                              <Card key={idx}>
                                <CardContent className="p-4">
                                  <p className="text-sm text-gray-700 mb-3">{post}</p>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(post)}
                                    className="gap-2"
                                  >
                                    <Copy className="w-4 h-4" />
                                    Copy
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Twitter */}
                      {generatedContent.twitter_posts && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">Twitter/X Posts</h3>
                          <div className="space-y-3">
                            {generatedContent.twitter_posts.map((post, idx) => (
                              <Card key={idx} className="border-blue-200 bg-blue-50">
                                <CardContent className="p-4">
                                  <p className="text-sm text-gray-700 mb-2">{post.tweet}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {post.hashtags?.map((tag, hidx) => (
                                      <Badge key={hidx} variant="secondary">{tag}</Badge>
                                    ))}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(`${post.tweet}\n${post.hashtags?.join(' ')}`)}
                                    className="w-full mt-3 gap-2"
                                  >
                                    <Copy className="w-4 h-4" />
                                    Copy
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Instagram */}
                      {generatedContent.instagram_posts && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">Instagram Posts</h3>
                          <div className="space-y-3">
                            {generatedContent.instagram_posts.map((post, idx) => (
                              <Card key={idx} className="border-pink-200 bg-pink-50">
                                <CardContent className="p-4">
                                  <p className="text-sm text-gray-700 mb-3">{post.caption}</p>
                                  <div className="mb-3">
                                    <p className="text-xs text-gray-600 font-medium mb-1">Emojis:</p>
                                    <div className="flex gap-1">
                                      {post.emoji_suggestions?.map((emoji, eidx) => (
                                        <span key={eidx} className="text-lg">{emoji}</span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {post.hashtags?.map((tag, hidx) => (
                                      <Badge key={hidx} className="bg-pink-200 text-pink-800">{tag}</Badge>
                                    ))}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(`${post.caption}\n${post.hashtags?.join(' ')}`)}
                                    className="w-full gap-2"
                                  >
                                    <Copy className="w-4 h-4" />
                                    Copy
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Email Sequences */}
                  {contentType === 'email' && generatedContent.email_sequence && (
                    <div className="space-y-4">
                      {generatedContent.email_sequence.map((email, idx) => (
                        <Card key={idx}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <Badge className="mb-2">Email {email.email_number}</Badge>
                                <p className="text-xs text-gray-600 font-medium">Purpose: {email.purpose}</p>
                              </div>
                              <Badge variant="outline">{email.send_delay_hours}h delay</Badge>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-medium mb-1">Subject Line</p>
                              <p className="text-sm font-medium text-gray-900">{email.subject_line}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-medium mb-1">Body</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{email.body}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-medium mb-1">CTA</p>
                              <p className="text-sm text-violet-600 font-medium">{email.cta}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(`Subject: ${email.subject_line}\n\n${email.body}\n\n${email.cta}`)}
                              className="w-full gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Copy
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Blog Content */}
                  {contentType === 'blog' && generatedContent.blog_posts && (
                    <div className="space-y-4">
                      {generatedContent.blog_posts.map((post, idx) => (
                        <Card key={idx}>
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <p className="text-xs text-gray-600 font-medium mb-1">Title</p>
                              <p className="text-lg font-bold text-gray-900">{post.title}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-medium mb-1">Primary Keyword</p>
                              <Badge className="bg-blue-100 text-blue-800">{post.primary_keyword}</Badge>
                            </div>
                            {post.secondary_keywords && (
                              <div>
                                <p className="text-xs text-gray-600 font-medium mb-1">Secondary Keywords</p>
                                <div className="flex flex-wrap gap-1">
                                  {post.secondary_keywords.map((kw, kidx) => (
                                    <Badge key={kidx} variant="outline">{kw}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-gray-600 font-medium mb-2">Meta Description</p>
                              <p className="text-sm text-gray-700 italic border-l-2 border-blue-300 pl-3">{post.meta_description}</p>
                            </div>
                            {post.outline && (
                              <div>
                                <p className="text-xs text-gray-600 font-medium mb-2">Outline</p>
                                <ul className="space-y-2">
                                  {post.outline.map((section, sidx) => (
                                    <li key={sidx} className="text-sm">
                                      <p className="font-medium text-gray-900">{section.section}</p>
                                      <ul className="ml-4 space-y-1 mt-1">
                                        {section.key_points?.map((point, pidx) => (
                                          <li key={pidx} className="text-xs text-gray-600">• {point}</li>
                                        ))}
                                      </ul>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                              <div>
                                <p className="text-gray-600">Word Count</p>
                                <p className="font-semibold">{post.estimated_word_count}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">SEO Potential</p>
                                <Badge className={`${post.seo_score_potential === 'high' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {post.seo_score_potential}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(`${post.title}\n\n${post.outline?.map(s => `${s.section}\n${s.key_points?.join('\n')}`).join('\n\n')}`)}
                              className="w-full gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Copy Outline
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}