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
    async addMeeting(client_id, datetime, teams_link, notes) {
        try {
            console.log("📌 Inserting meeting into DB:", { client_id, datetime, teams_link });
    
            const result = await pool.query(
                'INSERT INTO meetings (client_id, datetime, teams_link, notes) VALUES ($1, $2, $3, $4) RETURNING *',
                [client_id, datetime, teams_link, notes]
            );
    
            if (result.rows.length === 0) {
                console.log("❌ Meeting was NOT inserted into DB.");
                return null;
            }
    
            console.log("✅ Meeting added successfully:", result.rows[0]);
            return result.rows[0];
        } catch (error) {
            console.error("❌ Error inserting meeting:", error);
            throw error;
        }
    },    

    // Search meetings by client input
    async searchMeetingsByClient(query) {
        try {
            const result = await pool.query(`
                SELECT meetings.*, clients.name AS client_name, clients.email AS client_email 
                FROM meetings 
                JOIN clients ON meetings.client_id = clients.id 
                WHERE LOWER(clients.name) LIKE $1 OR LOWER(clients.email) LIKE $1
                ORDER BY meetings.datetime ASC
            `, [`%${query}%`]);

            return result.rows;
        } catch (error) {
            console.error("❌ Error searching meetings:", error);
            throw error;
        }
    },


    //search meeting by clients input
    async searchMeetingsByClient(query) {
        try {
            const result = await pool.query(`
                SELECT meetings.*, clients.name AS client_name, clients.email AS client_email 
                FROM meetings 
                JOIN clients ON meetings.client_id = clients.id 
                WHERE LOWER(clients.name) LIKE $1 OR LOWER(clients.email) LIKE $1
                ORDER BY meetings.datetime ASC
            `, [`%${query}%`]);

            return result.rows;
        } catch (error) {
            console.error("❌ Error searching meetings:", error);
            throw error;
        }
    },
};
    


module.exports = MeetingModel;
