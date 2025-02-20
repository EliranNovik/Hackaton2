const express = require('express');
const HomeModel = require('../models/homeModel.js');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const meetings = await HomeModel.getAllMeetings();
        const citizenshipStats = await HomeModel.getCitizenshipStats();

        res.render('home', { meetings, citizenshipStats });
    } catch (err) {
        console.error("❌ Error fetching data:", err);
        res.status(500).send("Database error.");
    }
});

module.exports = router;
