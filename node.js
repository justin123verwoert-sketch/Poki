const express = require('express');
const fetch = require('node-fetch'); // Install via: npm install node-fetch@2

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your actual Webhook URL
const WEBHOOK_URL = 'https://your-webhook-endpoint.com/api/notify';

app.use((req, res, next) => {
    // Extract real client IP (supports Cloudflare and standard reverse proxies)
    const clientIp = req.headers['cf-connecting-ip'] || 
                     req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                     req.socket.remoteAddress;

    // Send payload asynchronously to avoid delaying user page loads
    fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: `New visitor IP recorded: ${clientIp}`,
            timestamp: new Date().toISOString()
        })
    }).catch(err => console.error('Webhook error:', err));

    next();
});

app.get('/', (req, res) => {
    res.send('Welcome to the website!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
