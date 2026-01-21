import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all badges
    const allBadges = await base44.asServiceRole.entities.Badge.list();
    
    // Get user's already earned badges
    const earnedBadges = await base44.entities.UserAchievement.filter({
      user_email: user.email
    });
    const earnedBadgeIds = new Set(earnedBadges.map(b => b.badge_id));

    // Get user's metrics
    const deals = await base44.entities.SourcedDealOpportunity.filter({
      created_by: user.email
    });
    const closedDeals = deals.filter(d => d.status === 'accepted' || d.status === 'in_progress');
    
    const newBadges = [];

    // Check each badge criteria
    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.badge_id)) continue;

      const { metric, threshold } = badge.criteria || {};
      let qualified = false;

      switch (metric) {
        case 'deals_closed':
          qualified = closedDeals.length >= threshold;
          break;
        case 'total_points':
          qualified = (user.total_points || 0) >= threshold;
          break;
        case 'deals_sourced':
          qualified = deals.length >= threshold;
          break;
        case 'streak_days':
          qualified = (user.streak_days || 0) >= threshold;
          break;
      }

      if (qualified) {
        // Award the badge
        await base44.entities.UserAchievement.create({
          user_email: user.email,
          badge_id: badge.badge_id,
          badge_name: badge.name,
          earned_date: new Date().toISOString(),
          progress: 100
        });

        // Award bonus points
        if (badge.points_reward) {
          await base44.functions.invoke('awardPoints', {
            event_type: 'badge_earned',
            points: badge.points_reward,
            description: `Earned badge: ${badge.name}`,
            metadata: { badge_id: badge.badge_id }
          });
        }

        newBadges.push(badge);
      }
    }

    return Response.json({
      success: true,
      new_badges: newBadges,
      total_badges: earnedBadges.length + newBadges.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});