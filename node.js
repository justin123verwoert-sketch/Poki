const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Ensure you paste your complete Webhook URL here
const WEBHOOK_URL = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN';

app.use(async (req, res, next) => {
    // 2. Prevent triggering on browser favicon requests
    if (req.url === '/favicon.ico') return next();

    const clientIp = req.headers['cf-connecting-ip'] || 
                     req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                     req.socket.remoteAddress;

    console.log(`[INFO] New request from IP: ${clientIp}`);

    try {
        // 3. Using Node 18+ native global fetch (no external node-fetch required)
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // Note: Standard webhooks accept 'content'. If using Slack, change key to 'text'.
                content: `New visitor logged from IP: \`${clientIp}\``
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[ERROR] Webhook failed with status ${response.status}:`, errorText);
        } else {
            console.log('[SUCCESS] Webhook notification dispatched successfully.');
        }
    } catch (err) {
        console.error('[ERROR] Network failure sending webhook:', err.message);
    }

    next();
});

app.get('/', (req, res) => {
    res.send('Website loaded.');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
