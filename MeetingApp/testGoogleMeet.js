const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

async function testGoogleMeet() {
    try {
        const event = {
            summary: "Test Meeting",
            start: { dateTime: new Date().toISOString(), timeZone: "UTC" },
            end: { dateTime: new Date(new Date().getTime() + 60 * 60000).toISOString(), timeZone: "UTC" },
            conferenceData: { createRequest: { requestId: `meet${Date.now()}` } },
            attendees: [{ email: "your_test_email@gmail.com" }]
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1
        });

        console.log("✅ Google Meet Test Link:", response.data.hangoutLink);
    } catch (error) {
        console.error("❌ Google API Error:", error);
    }
}

testGoogleMeet();
