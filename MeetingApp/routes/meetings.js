const express = require('express');
const { google } = require('googleapis');
const MeetingModel = require('../models/meetingModel.js');
const ClientModel = require('../models/clientModel.js');
require('dotenv').config();
const router = express.Router();

// Configure OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Set credentials using the refresh token
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

// Initialize Google Calendar API
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// ✅ Get Meetings Page
router.get('/', async (req, res) => {
    try {
        const meetings = await MeetingModel.getAllMeetings();
        const clients = await ClientModel.getAllClients(); // Fetch clients for the dropdown
        res.render('meetings', { meetings, clients, page: 'meetings' });  // Pass clients to EJS
    } catch (err) {
        console.error("❌ Error fetching meetings:", err);
        res.status(500).send("Database error.");
    }
});

// ✅ Create a Google Meet Meeting and Store in DB
// ✅ Create a Google Meet Meeting and Store in DB
router.post('/create', async (req, res) => {
    console.log("📌 Received request body:", req.body);

    const { client_id, datetime } = req.body;

    if (!datetime || !client_id) {
        console.log("❌ Missing required fields:", { client_id, datetime });
        return res.status(400).json({ error: "❌ Missing required fields." });
    }

    try {
        const meetingStart = new Date(datetime).toISOString();
        const meetingEnd = new Date(new Date(meetingStart).getTime() + 60 * 60000).toISOString();

        console.log("✅ Meeting Start:", meetingStart);
        console.log("✅ Meeting End:", meetingEnd);

        const client = await ClientModel.getClientById(client_id);
        if (!client) {
            console.log("❌ Client not found in DB for ID:", client_id);
            return res.status(404).json({ error: "❌ Client not found." });
        }

        console.log("👤 Found Client:", client.name, "with email:", client.email);

        // Create Google Meet Event
        const event = {
            summary: "Client Meeting",
            description: `Meeting with ${client.name}`,
            start: { dateTime: meetingStart, timeZone: "UTC" },
            end: { dateTime: meetingEnd, timeZone: "UTC" },
            conferenceData: { createRequest: { requestId: `meet${Date.now()}` } },
            attendees: [{ email: client.email }]
        };

        console.log("📢 Creating Google Meet Event...");
        
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1
        });

        if (!response.data.hangoutLink) {
            console.log("❌ Google Meet link not generated!");
            return res.status(500).json({ error: "❌ Google Meet link generation failed." });
        }

        const teams_link = response.data.hangoutLink;
        console.log("🔗 Google Meet Link Generated:", teams_link);

        // Save Meeting to Database
        console.log("📢 Saving Meeting to Database...");
        const meeting = await MeetingModel.addMeeting(client_id, meetingStart, teams_link, "");

        console.log("✅ Meeting successfully saved to DB:", meeting);
        res.json({ success: true, teams_link });

    } catch (err) {
        console.error("❌ Error creating meeting:", err);
        res.status(500).json({ error: "Error creating meeting." });
    }
});


// SEARCH CLIENTS WITH MEETINGS
router.get('/search', async (req, res) => {
    const searchQuery = req.query.q.toLowerCase();

    try {
        const meetings = await MeetingModel.searchMeetingsByClient(searchQuery);
        res.json(meetings);
    } catch (err) {
        console.error("❌ Error searching for meetings:", err);
        res.status(500).json({ error: "Error fetching meetings" });
    }
});

router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.q.toLowerCase();

        console.log("🔍 Searching for meetings with query:", searchQuery);

        const meetings = await MeetingModel.searchMeetingsByClient(searchQuery);

        console.log("✅ Meetings found:", meetings);

        res.json(meetings);
    } catch (err) {
        console.error("❌ Error searching for meetings:", err);
        res.status(500).json({ error: "Error fetching meetings" });
    }
});

module.exports = router;
