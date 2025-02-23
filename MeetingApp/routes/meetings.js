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

// ✅ Create a Google Meet Meeting
router.post('/create', async (req, res) => {
    console.log("📌 Received request body:", req.body);

    const { client_id, datetime } = req.body;

    if (!datetime) {
        return res.status(400).json({ error: "❌ datetime is missing from the request." });
    }

    try {
        const meetingStart = new Date(datetime).toISOString();
        const meetingEnd = new Date(new Date(meetingStart).getTime() + 60 * 60000).toISOString();

        const client = await ClientModel.getClientById(client_id);
        if (!client) {
            return res.status(404).json({ error: "❌ Client not found." });
        }

        const event = {
            summary: "Client Meeting",
            description: `Meeting with ${client.name}`,
            start: { dateTime: meetingStart, timeZone: "UTC" },
            end: { dateTime: meetingEnd, timeZone: "UTC" },
            conferenceData: { createRequest: { requestId: `meet${Date.now()}` } },
            attendees: [{ email: client.email }]
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1
        });

        const meetLink = response.data.hangoutLink;

        await MeetingModel.addMeeting(client_id, meetingStart, meetLink, "");

        res.json({ success: true, meetLink });
    } catch (err) {
        console.error("❌ Error creating Google Meet meeting:", err);
        res.status(500).json({ error: "Error creating Google Meet meeting." });
    }
});


module.exports = router;
