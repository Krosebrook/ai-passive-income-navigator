import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Auto-generate SEO-optimized content for portfolio items
 * Keywords, meta tags, and promotional social media posts
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { portfolioIdeaId } = await req.json();

    if (!portfolioIdeaId) {
      return Response.json({ 
        error: 'Missing required field: portfolioIdeaId' 
      }, { status: 400 });
    }

    // Get portfolio idea details
    const ideas = await base44.entities.PortfolioIdea.filter({ id: portfolioIdeaId });
    const idea = ideas[0];

    if (!idea) {
      return Response.json({ error: 'Portfolio idea not found' }, { status: 404 });
    }

    const prompt = `Generate comprehensive SEO-optimized content for this passive income business:

BUSINESS DETAILS:
Title: ${idea.title}
Description: ${idea.description || 'No description provided'}
Category: ${idea.category || 'General'}
Status: ${idea.status}
Estimated Monthly Income: $${idea.estimated_monthly_income || 0}

Create SEO content to attract traffic and potential buyers:

1. PRIMARY KEYWORDS (10-15)
   - High-volume, relevant keywords for this business niche
   - Include long-tail keywords
   - Focus on buyer intent keywords

2. META TAGS
   - SEO-optimized meta title (55-60 chars)
   - Compelling meta description (150-155 chars)
   - Include primary keyword naturally

3. SOCIAL MEDIA PROMOTIONAL POSTS
   Generate 3 platform-specific posts:
   
   a) TWITTER/X POST (280 chars max)
      - Catchy hook
      - Value proposition
      - Call to action
      - Relevant hashtags
   
   b) LINKEDIN POST (1300 chars max)
      - Professional tone
      - Business benefits
      - Success metrics
      - Engagement question
   
   c) INSTAGRAM CAPTION (2200 chars max)
      - Inspirational tone
      - Storytelling approach
      - Emoji usage
      - Strong hashtag strategy

4. HEADLINE VARIATIONS (5 options)
   - Attention-grabbing headlines
   - Include power words
   - Optimized for click-through

5. VALUE PROPOSITIONS (3-5 unique angles)
   - Different ways to position this business
   - Highlight unique benefits

6. TARGET AUDIENCE KEYWORDS
   - Keywords your ideal customers are searching for

Return as JSON with this structure:
{
  "primary_keywords": ["keyword1", "keyword2", ...],
  "long_tail_keywords": ["phrase1", "phrase2", ...],
  "meta_title": "title",
  "meta_description": "description",
  "social_posts": {
    "twitter": "post content",
    "linkedin": "post content",
    "instagram": "post content"
  },
  "twitter_hashtags": ["#tag1", "#tag2", ...],
  "linkedin_hashtags": ["#tag1", "#tag2", ...],
  "instagram_hashtags": ["#tag1", "#tag2", ...],
  "headline_variations": ["headline1", "headline2", ...],
  "value_propositions": ["prop1", "prop2", ...],
  "target_audience_keywords": ["audience1 keywords", ...]
}

Make everything compelling, actionable, and optimized for conversions.`;

    const seoContent = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          primary_keywords: { type: 'array', items: { type: 'string' } },
          long_tail_keywords: { type: 'array', items: { type: 'string' } },
          meta_title: { type: 'string' },
          meta_description: { type: 'string' },
          social_posts: { type: 'object' },
          twitter_hashtags: { type: 'array', items: { type: 'string' } },
          linkedin_hashtags: { type: 'array', items: { type: 'string' } },
          instagram_hashtags: { type: 'array', items: { type: 'string' } },
          headline_variations: { type: 'array', items: { type: 'string' } },
          value_propositions: { type: 'array', items: { type: 'string' } },
          target_audience_keywords: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    // Save SEO content
    const savedContent = await base44.entities.ContentGeneration.create({
      portfolio_idea_id: portfolioIdeaId,
      content_type: 'seo_package',
      platform: 'multi',
      topic: `SEO content for ${idea.title}`,
      tone: 'professional',
      target_audience: 'Potential buyers and traffic',
      generated_content: JSON.stringify(seoContent, null, 2),
      seo_keywords: [
        ...seoContent.primary_keywords,
        ...seoContent.long_tail_keywords
      ],
      meta_title: seoContent.meta_title,
      meta_description: seoContent.meta_description,
      hashtags: [
        ...seoContent.twitter_hashtags,
        ...seoContent.linkedin_hashtags,
        ...seoContent.instagram_hashtags
      ],
      engagement_tips: [
        'Use primary keywords naturally in your content',
        'Post consistently across all social platforms',
        'Engage with comments and questions promptly',
        'Test different headlines to see what resonates',
        'Track keyword rankings and adjust strategy'
      ]
    });

    return Response.json({
      ...savedContent,
      seo_package: seoContent
    });
  } catch (error) {
    console.error('SEO content generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});