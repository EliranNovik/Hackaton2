const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');
const clientRoutes = require('./routes/clients.js');
const meetingRoutes = require('./routes/meetings.js');
const authRoutes = require('./routes/auth.js'); // Import auth routes
const homeRoutes = require('./routes/home.js'); // Import home routes


dotenv.config();

const app = express();

// Check required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    console.error("❌ Missing Google OAuth environment variables! Please check your .env file.");
    process.exit(1);
}

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/', homeRoutes); // Use home routes for the homepage

// ✅ Ensure JSON body parsing is enabled
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session for authentication
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

// Register authentication routes
app.use('/auth', authRoutes);

// Register main routes
app.use('/clients', clientRoutes);
app.use('/meetings', meetingRoutes);

// Home route
app.get('/', (req, res) => {
    res.render('index');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
