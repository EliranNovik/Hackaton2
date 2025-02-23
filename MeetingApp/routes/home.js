const express = require('express');
const HomeModel = require('../models/homeModel.js');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const meetings = await HomeModel.getMeetingsForCurrentWeek();
        const citizenshipStats = await HomeModel.getCitizenshipStats(); // Fetch citizenship stats

        // Organize meetings by day of the week
        const meetingsByDay = {};
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        meetings.forEach(meeting => {
            const meetingDate = new Date(meeting.datetime);
            const dayName = daysOfWeek[meetingDate.getDay()];

            if (!meetingsByDay[dayName]) {
                meetingsByDay[dayName] = [];
            }
            meetingsByDay[dayName].push(meeting);
        });

        res.render('home', { meetingsByDay, citizenshipStats }); // Pass citizenshipStats to EJS
    } catch (err) {
        console.error("❌ Error fetching home data:", err);
        res.status(500).send("Database error.");
    }
});

module.exports = router;
