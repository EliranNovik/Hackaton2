const express = require('express');
const { google } = require('googleapis');
require('dotenv').config();
const router = express.Router();

// Ensure environment variables are set
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    console.error("❌ Missing Google OAuth environment variables! Please check your .env file.");
    process.exit(1);
}

// Configure OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Redirect user to Google for authentication
router.get('/google', (req, res) => {
    try {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline', // Get refresh token
            scope: [
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/calendar.events'
            ],
            prompt: 'consent' // Force consent screen to get refresh token
        });

        console.log("🔗 Redirecting to Google for authentication...");
        res.redirect(authUrl);
    } catch (error) {
        console.error("❌ Error generating auth URL:", error);
        res.status(500).send("Error initiating Google authentication.");
    }
});

// Handle Google OAuth callback
router.get('/google/callback', async (req, res) => {
    const code = req.query.code;
    
    if (!code) {
        return res.status(400).send("❌ Authorization code not found.");
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);

        console.log("✅ Access Token:", tokens.access_token);
        console.log("✅ Refresh Token:", tokens.refresh_token || "❌ No refresh token received!");

        if (!tokens.refresh_token) {
            return res.status(400).send("❌ No refresh token received. Try logging in again.");
        }

        // Save the refresh token in .env or database
        console.log("🔄 Save this refresh token in your .env file:");
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);

        res.send("✅ Authentication successful! Check the console for your refresh token.");
    } catch (error) {
        console.error("❌ Error exchanging code for tokens:", error);
        res.status(500).send("Error authenticating with Google.");
    }
});

module.exports = router;
