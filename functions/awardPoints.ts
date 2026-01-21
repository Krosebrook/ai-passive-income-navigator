import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_type, points, description, metadata } = await req.json();

    if (!event_type || !points) {
      return Response.json({ error: 'event_type and points are required' }, { status: 400 });
    }

    // Log the gamification event
    await base44.entities.GamificationEvent.create({
      user_email: user.email,
      event_type,
      points,
      description: description || `Earned ${points} points for ${event_type}`,
      metadata: metadata || {}
    });

    // Update user's total points
    const currentPoints = user.total_points || 0;
    const newPoints = currentPoints + points;
    const newLevel = Math.floor(newPoints / 1000) + 1; // Level up every 1000 points

    await base44.auth.updateMe({
      total_points: newPoints,
      level: newLevel
    });

    return Response.json({
      success: true,
      new_total: newPoints,
      level: newLevel,
      points_earned: points
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});