import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generates AI-powered marketing content for passive income ideas
 * Creates ad copy, social media posts, email sequences, and SEO content
 * 
 * @param {string} ideaTitle - Title of the idea
 * @param {string} ideaDescription - Description of the idea
 * @param {string} targetAudience - Target audience for marketing
 * @param {string} contentType - Type of content to generate (ads|social|email|blog)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ideaTitle, ideaDescription, targetAudience, contentType } = await req.json();

    let prompt = '';
    let responseSchema = {};

    if (contentType === 'ads') {
      prompt = `Create 5 high-converting ad copy variations for this passive income idea:

Idea: ${ideaTitle}
Description: ${ideaDescription}
Target Audience: ${targetAudience}

Generate ads for Google Ads and Facebook. Each should be compelling, benefit-focused, and action-oriented.

Return JSON with:
{
  "google_ads": [
    {
      "headline": "string (30 chars max)",
      "description": "string (90 chars max)",
      "cta": "call to action"
    }
  ],
  "facebook_ads": [
    {
      "headline": "string",
      "body": "string (compelling copy)",
      "cta_button": "Learn More|Sign Up|Get Started",
      "hook": "attention-grabbing opening line"
    }
  ]
}`;

      responseSchema = {
        type: 'object',
        properties: {
          google_ads: { type: 'array', items: { type: 'object' } },
          facebook_ads: { type: 'array', items: { type: 'object' } }
        }
      };
    } else if (contentType === 'social') {
      prompt = `Create 3 social media post variations for this passive income idea:

Idea: ${ideaTitle}
Description: ${ideaDescription}
Target Audience: ${targetAudience}

Create engaging, platform-specific content.

Return JSON with:
{
  "linkedin_posts": ["post1", "post2", "post3"],
  "twitter_posts": [
    {
      "tweet": "string (280 chars max)",
      "hashtags": ["hashtag1", "hashtag2"]
    }
  ],
  "instagram_posts": [
    {
      "caption": "string (engaging caption)",
      "hashtags": ["hashtag1", "hashtag2"],
      "emoji_suggestions": ["emoji1", "emoji2"]
    }
  ]
}`;

      responseSchema = {
        type: 'object',
        properties: {
          linkedin_posts: { type: 'array', items: { type: 'string' } },
          twitter_posts: { type: 'array', items: { type: 'object' } },
          instagram_posts: { type: 'array', items: { type: 'object' } }
        }
      };
    } else if (contentType === 'email') {
      prompt = `Create a 5-email nurture sequence for this passive income idea:

Idea: ${ideaTitle}
Description: ${ideaDescription}
Target Audience: ${targetAudience}

Each email should have a specific purpose in the customer journey.

Return JSON with:
{
  "email_sequence": [
    {
      "email_number": 1,
      "subject_line": "string",
      "purpose": "awareness|interest|consideration|action|retention",
      "body": "email content",
      "cta": "call to action",
      "send_delay_hours": number
    }
  ]
}`;

      responseSchema = {
        type: 'object',
        properties: {
          email_sequence: { type: 'array', items: { type: 'object' } }
        }
      };
    } else if (contentType === 'blog') {
      prompt = `Create 5 SEO-optimized blog post ideas for this passive income idea:

Idea: ${ideaTitle}
Description: ${ideaDescription}
Target Audience: ${targetAudience}

Each should be optimized for search engines and valuable for the target audience.

Return JSON with:
{
  "blog_posts": [
    {
      "title": "string (SEO-optimized)",
      "primary_keyword": "string",
      "secondary_keywords": ["keyword1", "keyword2"],
      "outline": [
        {
          "section": "string",
          "key_points": ["point1", "point2"]
        }
      ],
      "meta_description": "string (160 chars max)",
      "estimated_word_count": number,
      "seo_score_potential": "high|medium|low"
    }
  ]
}`;

      responseSchema = {
        type: 'object',
        properties: {
          blog_posts: { type: 'array', items: { type: 'object' } }
        }
      };
    }

    const content = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: responseSchema
    });

    return Response.json(content);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});