import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Sparkles, Copy, Download, FileText, Hash, 
  TrendingUp, Users, Loader2 
} from 'lucide-react';

/**
 * AI Content Assistant
 * Generates articles, social posts with SEO optimization
 */
export default function ContentAssistant({ portfolioIdeaId }) {
  const [formData, setFormData] = useState({
    contentType: 'article',
    platform: 'blog',
    topic: '',
    tone: 'professional',
    targetAudience: '',
    wordCount: 500
  });
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const handleGenerate = async () => {
    if (!formData.topic) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateContent', {
        portfolioIdeaId,
        ...formData
      });

      setGeneratedContent(response.data);
      toast.success('Content generated!');
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Content Type</Label>
              <Select
                value={formData.contentType}
                onValueChange={(value) => setFormData({ ...formData, contentType: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="social_media">Social Media Post</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="ad_copy">Ad Copy</SelectItem>
                  <SelectItem value="video_script">Video Script</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Platform</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Topic *</Label>
            <Input
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g., How to start a successful print-on-demand business"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tone</Label>
              <Select
                value={formData.tone}
                onValueChange={(value) => setFormData({ ...formData, tone: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Word Count</Label>
              <Input
                type="number"
                value={formData.wordCount}
                onChange={(e) => setFormData({ ...formData, wordCount: parseInt(e.target.value) })}
                min="100"
                max="2000"
              />
            </div>
          </div>

          <div>
            <Label>Target Audience</Label>
            <Input
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              placeholder="e.g., Aspiring entrepreneurs, stay-at-home parents"
            />
          </div>

          <Button onClick={handleGenerate} disabled={generating} className="w-full">
            {generating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Generate Content</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Content</CardTitle>
        </CardHeader>
        <CardContent>
          {!generatedContent ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Your generated content will appear here</p>
            </div>
          ) : (
            <Tabs defaultValue="content">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="tips">Tips</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={generatedContent.generated_content}
                    readOnly
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generatedContent.generated_content)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" />
                    Meta Title
                  </Label>
                  <div className="flex gap-2">
                    <Input value={generatedContent.meta_title} readOnly />
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(generatedContent.meta_title)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" />
                    Meta Description
                  </Label>
                  <div className="flex gap-2">
                    <Textarea value={generatedContent.meta_description} readOnly rows={3} />
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(generatedContent.meta_description)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    SEO Keywords
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.seo_keywords?.map((kw, idx) => (
                      <Badge key={idx} variant="secondary">{kw}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4" />
                    Hashtags
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.hashtags?.map((tag, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-700">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tips" className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Engagement Tips
                </Label>
                <ul className="space-y-2">
                  {generatedContent.engagement_tips?.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-violet-600 font-bold">{idx + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}