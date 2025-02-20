const pool = require('./db.js'); // Ensure database connection is imported

const MeetingModel = {
    // Get all meetings
    async getAllMeetings() {
        try {
            const result = await pool.query(`
                SELECT meetings.*, clients.name AS client_name, clients.email AS client_email 
                FROM meetings 
                JOIN clients ON meetings.client_id = clients.id 
                ORDER BY meetings.datetime DESC
            `);
            return result.rows;
        } catch (error) {
            console.error("❌ Error fetching meetings:", error);
            throw error;
        }
    },

    // Create a new meeting
    async addMeeting(clientId, datetime, teamsLink, notes) {
        try {
            const result = await pool.query(
                'INSERT INTO meetings (client_id, datetime, teams_link, notes) VALUES ($1, $2, $3, $4) RETURNING *',
                [clientId, datetime, teamsLink, notes]
            );
            console.log("✅ Meeting added successfully:", result.rows[0]);
            return result.rows[0];
        } catch (error) {
            console.error("❌ Error inserting meeting:", error);
            throw error;
        }
    }
    
};

module.exports = MeetingModel;
