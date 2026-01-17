import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Sparkles, Copy, Search, Hash, Megaphone, 
  TrendingUp, Target, Loader2, CheckCircle
} from 'lucide-react';

export default function SEOContentModal({ open, onClose, portfolioIdea }) {
  const [generating, setGenerating] = useState(false);
  const [seoContent, setSeoContent] = useState(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateSEOContent', {
        portfolioIdeaId: portfolioIdea.id
      });

      setSeoContent(response.data.seo_package);
      toast.success('SEO content generated!');
    } catch (error) {
      console.error('Failed to generate SEO content:', error);
      toast.error('Failed to generate SEO content');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  React.useEffect(() => {
    if (open && !seoContent) {
      handleGenerate();
    }
  }, [open]);

  if (!portfolioIdea) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            SEO-Optimized Content for {portfolioIdea.title}
          </DialogTitle>
        </DialogHeader>

        {generating ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
            <p className="text-gray-600">Generating SEO content with AI...</p>
            <p className="text-sm text-gray-500 mt-2">This may take 20-30 seconds</p>
          </div>
        ) : seoContent ? (
          <Tabs defaultValue="keywords" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="meta">Meta Tags</TabsTrigger>
              <TabsTrigger value="social">Social Posts</TabsTrigger>
              <TabsTrigger value="headlines">Headlines</TabsTrigger>
            </TabsList>

            <TabsContent value="keywords" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Search className="w-4 h-4 text-blue-600" />
                        Primary Keywords
                      </h3>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(seoContent.primary_keywords.join(', '))}
                      >
                        <Copy className="w-3 h-3 mr-1" /> Copy All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {seoContent.primary_keywords?.map((kw, idx) => (
                        <Badge 
                          key={idx} 
                          className="bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200"
                          onClick={() => copyToClipboard(kw)}
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        Long-Tail Keywords
                      </h3>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(seoContent.long_tail_keywords.join(', '))}
                      >
                        <Copy className="w-3 h-3 mr-1" /> Copy All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {seoContent.long_tail_keywords?.map((kw, idx) => (
                        <Badge 
                          key={idx} 
                          className="bg-emerald-100 text-emerald-700 cursor-pointer hover:bg-emerald-200"
                          onClick={() => copyToClipboard(kw)}
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-orange-600" />
                      Target Audience Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {seoContent.target_audience_keywords?.map((kw, idx) => (
                        <Badge 
                          key={idx} 
                          className="bg-orange-100 text-orange-700 cursor-pointer hover:bg-orange-200"
                          onClick={() => copyToClipboard(kw)}
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meta" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Meta Title</h3>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(seoContent.meta_title)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm">{seoContent.meta_title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {seoContent.meta_title.length} characters
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Meta Description</h3>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(seoContent.meta_description)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm">{seoContent.meta_description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {seoContent.meta_description.length} characters
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <strong>SEO Best Practices:</strong> Your meta tags are optimized for length 
                        and include primary keywords naturally.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              {/* Twitter */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-blue-500" />
                      Twitter/X Post
                    </h3>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(seoContent.social_posts.twitter)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm whitespace-pre-wrap">{seoContent.social_posts.twitter}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {seoContent.twitter_hashtags?.map((tag, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-700">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* LinkedIn */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-blue-700" />
                      LinkedIn Post
                    </h3>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(seoContent.social_posts.linkedin)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border max-h-64 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{seoContent.social_posts.linkedin}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {seoContent.linkedin_hashtags?.map((tag, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-700">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Instagram */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-pink-600" />
                      Instagram Caption
                    </h3>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(seoContent.social_posts.instagram)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border max-h-64 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{seoContent.social_posts.instagram}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {seoContent.instagram_hashtags?.map((tag, idx) => (
                      <Badge key={idx} className="bg-pink-100 text-pink-700">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="headlines" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Headline Variations</h3>
                    <div className="space-y-2">
                      {seoContent.headline_variations?.map((headline, idx) => (
                        <div 
                          key={idx} 
                          className="p-3 bg-gray-50 rounded-lg border hover:border-violet-300 transition-colors cursor-pointer"
                          onClick={() => copyToClipboard(headline)}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-violet-600 font-bold">{idx + 1}</span>
                            <p className="text-sm flex-1">{headline}</p>
                            <Copy className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Value Propositions</h3>
                    <div className="space-y-2">
                      {seoContent.value_propositions?.map((prop, idx) => (
                        <div 
                          key={idx} 
                          className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 hover:border-emerald-400 transition-colors cursor-pointer"
                          onClick={() => copyToClipboard(prop)}
                        >
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm flex-1">{prop}</p>
                            <Copy className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}