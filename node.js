const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Set your FRESH Discord Webhook URL here
const DISCORD_WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1544669985962463252/iuBYhMm9-K_XvYFPDfAqCyphjclkajMz_LNXSQkWIwh9gmXYLbjWT00NcCg3EsKiiRZE';

app.use(async (req, res, next) => {
    // Ignore automatic browser requests for site icons
    if (req.url === '/favicon.ico') return next();

    // 1. Extract the IP address
    let clientIp = req.headers['cf-connecting-ip'] || 
                   req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                   req.socket.remoteAddress;

    // Convert local IPv6 loopback to readable text for local testing
    if (clientIp === '::1' || clientIp === '127.0.0.1') {
        clientIp = '127.0.0.1 (Localhost Testing)';
    }

    console.log(`Attempting to send IP: ${clientIp}`);

    // 2. Send to Discord Webhook
    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'NodeJS-IP-Logger/1.0' // Prevents Discord bot-blocking filters
            },
            body: JSON.stringify({
                content: `🚨 **New Site Visitor**\n**IP Address:** \`${clientIp}\``
            })
        });

        if (response.ok) {
            console.log('✅ Successfully delivered to Discord!');
        } else {
            const errorData = await response.text();
            console.error(`❌ Discord rejected request (${response.status}):`, errorData);
        }
    } catch (err) {
        console.error('❌ Network Error:', err.message);
    }

    next();
});

app.get('/', (req, res) => {
    res.send('Website Loaded');
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
