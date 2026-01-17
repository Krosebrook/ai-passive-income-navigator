import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI Content Generation
 * Drafts articles, social media posts with SEO optimization
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      portfolioIdeaId, 
      contentType, 
      platform, 
      topic, 
      tone = 'professional',
      targetAudience,
      wordCount = 500
    } = await req.json();

    if (!contentType || !topic) {
      return Response.json({ 
        error: 'Missing required fields: contentType, topic' 
      }, { status: 400 });
    }

    // Build content generation prompt
    const prompt = `Generate ${contentType} content for ${platform || 'general audience'}:

Topic: ${topic}
Tone: ${tone}
Target Audience: ${targetAudience || 'General'}
Word Count: ${wordCount}

Requirements:
1. Create engaging, high-quality ${contentType} content
2. Use ${tone} tone throughout
3. Optimize for ${platform || 'web'} platform
4. Include natural keyword integration for SEO
5. Make it actionable and valuable

Also provide:
- 10-15 relevant SEO keywords
- Meta title (60 chars max)
- Meta description (155 chars max)
- ${platform === 'twitter' || platform === 'instagram' || platform === 'tiktok' ? '10-15 relevant hashtags' : '5-8 hashtags'}
- 3-5 engagement tips for this content

Return JSON:
{
  "content": "full content here",
  "seo_keywords": ["keyword1", "keyword2", ...],
  "meta_title": "title",
  "meta_description": "description",
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "engagement_tips": ["tip 1", "tip 2", ...]
}`;

    const generated = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          seo_keywords: { type: 'array', items: { type: 'string' } },
          meta_title: { type: 'string' },
          meta_description: { type: 'string' },
          hashtags: { type: 'array', items: { type: 'string' } },
          engagement_tips: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    // Save generated content
    const savedContent = await base44.entities.ContentGeneration.create({
      portfolio_idea_id: portfolioIdeaId,
      content_type: contentType,
      platform: platform || 'blog',
      topic,
      tone,
      target_audience: targetAudience,
      word_count: wordCount,
      generated_content: generated.content,
      seo_keywords: generated.seo_keywords,
      meta_title: generated.meta_title,
      meta_description: generated.meta_description,
      hashtags: generated.hashtags,
      engagement_tips: generated.engagement_tips
    });

    return Response.json(savedContent);
  } catch (error) {
    console.error('Content generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});