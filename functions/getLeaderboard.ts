import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { metric = 'total_points', limit = 10 } = await req.json().catch(() => ({}));

    // Get all users with their stats
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    // Calculate stats for each user
    const userStats = await Promise.all(
      allUsers.map(async (u) => {
        const deals = await base44.asServiceRole.entities.SourcedDealOpportunity.filter({
          created_by: u.email
        });
        const closedDeals = deals.filter(d => d.status === 'accepted' || d.status === 'in_progress');
        const badges = await base44.asServiceRole.entities.UserAchievement.filter({
          user_email: u.email
        });

        return {
          email: u.email,
          full_name: u.full_name,
          total_points: u.total_points || 0,
          level: u.level || 1,
          deals_sourced: deals.length,
          deals_closed: closedDeals.length,
          badges_earned: badges.length,
          streak_days: u.streak_days || 0
        };
      })
    );

    // Sort by the requested metric
    userStats.sort((a, b) => (b[metric] || 0) - (a[metric] || 0));

    // Take top performers
    const topPerformers = userStats.slice(0, limit);

    // Find current user's rank
    const userRank = userStats.findIndex(u => u.email === user.email) + 1;

    return Response.json({
      leaderboard: topPerformers,
      user_rank: userRank,
      metric
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});