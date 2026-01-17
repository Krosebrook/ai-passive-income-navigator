import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { type, channel, message, title, data } = await req.json();

        let result;

        if (channel === 'slack') {
            const slackToken = Deno.env.get('SLACK_BOT_TOKEN');
            if (!slackToken) throw new Error('Slack not configured');

            result = await fetch('https://slack.com/api/chat.postMessage', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${slackToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    channel: user.slack_channel_id || '#notifications',
                    text: message,
                    blocks: [
                        {
                            type: 'header',
                            text: { type: 'plain_text', text: title }
                        },
                        {
                            type: 'section',
                            text: { type: 'mrkdwn', text: message }
                        }
                    ]
                })
            });
        } else if (channel === 'email') {
            result = await base44.integrations.Core.SendEmail({
                to: user.email,
                subject: title,
                body: message
            });
        } else if (channel === 'sms') {
            const twilioKey = Deno.env.get('TWILIO_AUTH_TOKEN');
            if (!twilioKey) throw new Error('Twilio not configured');
            // SMS implementation
        }

        return Response.json({ success: true, result });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});