import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI-powered user matching for collaboration
 * Suggests potential collaborators based on investment criteria, interests, and activity
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user's preferences and criteria
    const [userPrefs, userCriteria, userGroups] = await Promise.all([
      base44.entities.UserPreferences.filter({ created_by: user.email }),
      base44.entities.DealSourcingCriteria.filter({ created_by: user.email }),
      base44.entities.InvestmentGroup.list()
    ]);

    // Get all users (excluding current user)
    const allUsers = await base44.asServiceRole.entities.User.list();
    const otherUsers = allUsers.filter(u => u.email !== user.email);

    // Get preferences and criteria for all other users
    const [allPrefs, allCriteria] = await Promise.all([
      base44.asServiceRole.entities.UserPreferences.list(),
      base44.asServiceRole.entities.DealSourcingCriteria.list()
    ]);

    const currentUserData = {
      email: user.email,
      name: user.full_name,
      preferences: userPrefs[0] || {},
      criteria: userCriteria,
      groups: userGroups.filter(g => 
        g.creator_email === user.email || 
        g.members?.some(m => m.email === user.email)
      )
    };

    const otherUsersData = otherUsers.map(u => ({
      email: u.email,
      name: u.full_name,
      preferences: allPrefs.find(p => p.created_by === u.email) || {},
      criteria: allCriteria.filter(c => c.created_by === u.email),
      groups: userGroups.filter(g => 
        g.creator_email === u.email || 
        g.members?.some(m => m.email === u.email)
      )
    }));

    const prompt = `You are an AI matchmaking system for passive income investors. Analyze the current user and suggest the top 5 most compatible collaborators.

CURRENT USER:
- Name: ${currentUserData.name}
- Investment Interests: ${currentUserData.preferences.industries_of_interest?.join(', ') || 'Not specified'}
- Risk Tolerance: ${currentUserData.preferences.risk_tolerance || 'Not specified'}
- Skills: ${currentUserData.preferences.skills?.join(', ') || 'Not specified'}
- Active Criteria: ${currentUserData.criteria.length} sourcing criteria
- Groups: ${currentUserData.groups.length} investment groups

OTHER USERS DATA:
${otherUsersData.slice(0, 20).map(u => `
- ${u.name} (${u.email})
  Interests: ${u.preferences.industries_of_interest?.join(', ') || 'N/A'}
  Risk: ${u.preferences.risk_tolerance || 'N/A'}
  Skills: ${u.preferences.skills?.join(', ') || 'N/A'}
  Criteria: ${u.criteria.length}
  Groups: ${u.groups.length}
`).join('\n')}

For each of the top 5 matches, provide:
1. User email and name
2. Match score (0-100)
3. Match reason (why they're compatible)
4. Collaboration opportunities (specific areas to collaborate)
5. Complementary skills or interests

Return as JSON array.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                user_email: { type: 'string' },
                user_name: { type: 'string' },
                match_score: { type: 'number' },
                match_reason: { type: 'string' },
                collaboration_opportunities: { 
                  type: 'array', 
                  items: { type: 'string' } 
                },
                complementary_aspects: { 
                  type: 'array', 
                  items: { type: 'string' } 
                }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      suggestions: response.suggestions || []
    });

  } catch (error) {
    console.error('Collaboration suggestion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});