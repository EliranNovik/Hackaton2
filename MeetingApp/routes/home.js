const express = require('express');
const HomeModel = require('../models/homeModel.js');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const meetings = await HomeModel.getAllMeetings();
        res.render('home', { meetings });
    } catch (err) {
        console.error("❌ Error fetching meetings:", err);
        res.status(500).send("Database error.");
    }
});

module.exports = router;
