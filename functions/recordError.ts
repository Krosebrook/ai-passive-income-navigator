import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const errorData = await req.json();
    
    // Store error in database for analysis
    const base44 = createClientFromRequest(req);
    
    await base44.asServiceRole.entities.ErrorLog.create({
      message: errorData.message,
      stack: errorData.stack,
      context: errorData.context,
      url: errorData.url,
      timestamp: new Date().toISOString()
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error recording error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});