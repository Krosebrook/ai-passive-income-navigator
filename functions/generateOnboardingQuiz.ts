import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { validatePreferences, sanitizeObject } from './utils/validation.js';
import { checkRateLimit, validateContentLength, addSecurityHeaders } from './utils/security.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    checkRateLimit(user.email);
    validateContentLength(req);

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      return Response.json({ error: 'PERPLEXITY_API_KEY not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { preferences, topic } = body;
    
    if (!preferences || typeof preferences !== 'object') {
      return Response.json({ error: 'Invalid preferences object' }, { status: 400 });
    }
    
    const validatedPrefs = validatePreferences(sanitizeObject(preferences));

    const quizPrompt = `Generate an interactive quiz to assess user understanding during onboarding for a passive income investment platform.

Topic: ${topic || 'Investment Basics'}

User Profile:
${JSON.stringify(validatedPrefs, null, 2)}

Create a 5-question quiz that:
1. Tests key concepts related to their chosen investment path
2. Matches their risk tolerance and experience level
3. Helps us understand what they already know vs. need to learn
4. Uses clear, non-technical language (unless they indicated advanced skills)

For each question provide:
- question: Clear question text
- options: Array of 4 plausible answer choices
- correct_answer: The correct option (exact match from options array)
- explanation: Brief explanation of why this is correct (1-2 sentences)
- difficulty: "beginner" | "intermediate" | "advanced"

Return as JSON:
{
  "title": "Quiz title",
  "description": "Brief description",
  "questions": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correct_answer": "...",
      "explanation": "...",
      "difficulty": "beginner"
    }
  ]
}`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: quizPrompt }],
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let quiz = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quiz = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Quiz parsing error:', e);
      quiz = { error: 'Failed to parse quiz', raw_content: content };
    }

    const jsonResponse = Response.json({
      success: true,
      quiz,
      generated_at: new Date().toISOString()
    });
    
    return addSecurityHeaders(jsonResponse);

  } catch (error) {
    console.error('Quiz generation error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to generate quiz'
    }, { status: 500 });
  }
});