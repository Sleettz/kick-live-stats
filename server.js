// server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

// Endpoint to get streamer stats
app.get('/api/stats/:username', async (req, res) => {
  const username = req.params.username;
  try {
    // Get channel info
    const channelRes = await fetch(`https://kick.com/api/v1/channels/${username}`);
    if (!channelRes.ok) return res.status(404).json({ error: 'Streamer not found!' });
    const channel = await channelRes.json();

    if (!channel.livestream) return res.status(400).json({ error: 'Streamer is not live!' });

    // Get chat messages for chats per minute
    let chatsPerMinute = "N/A";
    let engagementRate = "N/A";
    try {
      const chatRes = await fetch(`https://kick.com/api/v2/channels/${channel.id}/messages?limit=100`);
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        const oneMinuteAgo = Date.now() - 60 * 1000;
        const recentChats = chatData.data.filter(msg => new Date(msg.created_at).getTime() > oneMinuteAgo);
        chatsPerMinute = recentChats.length;
        if (channel.livestream.viewer_count > 0) {
          engagementRate = ((chatsPerMinute / channel.livestream.viewer_count) * 100).toFixed(2) + "%";
        }
      }
    } catch (err) {}

    res.json({
      username: channel.user.username,
      live: true,
      liveViewers: channel.livestream.viewer_count,
      followers: channel.followers_count,
      subs: channel.subscription_count || 'N/A',
      chatsPerMinute,
      engagementRate,
      uniqueViewers: 'N/A' // Not available from public API
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
