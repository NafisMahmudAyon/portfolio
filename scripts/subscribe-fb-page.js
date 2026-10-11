#!/usr/bin/env node

/**
 * Script to subscribe your Facebook Page (Nafisbd) to App feed webhooks using Graph API v21.0
 * 
 * Usage:
 *   node scripts/subscribe-fb-page.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pageId = process.env.FB_PAGE_ID || process.argv[2];
const pageToken = process.env.FB_PAGE_ACCESS_TOKEN || process.argv[3];

if (!pageId || !pageToken) {
  console.error(`
❌ Error: Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN in .env
`);
  process.exit(1);
}

async function subscribePage() {
  const postUrl = `https://graph.facebook.com/v21.0/${pageId}/subscribed_apps`;
  console.log(`📡 Subscribing Page ${pageId} to feed webhooks (v21.0)...`);

  try {
    const res = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        subscribed_fields: 'feed',
        access_token: pageToken,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error('❌ Subscription failed:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('✅ Success! Page is now subscribed to the App Webhook:', data);

    // Verify by checking active subscriptions
    console.log('🔍 Checking active subscribed apps...');
    const verifyRes = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}/subscribed_apps?access_token=${pageToken}`
    );
    const verifyData = await verifyRes.json();
    console.log('📋 Current Subscriptions:', JSON.stringify(verifyData, null, 2));
  } catch (err) {
    console.error('❌ Network or API error:', err.message);
  }
}

subscribePage();
