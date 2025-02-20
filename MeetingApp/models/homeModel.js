const pool = require('./db.js'); // Import database connection

const HomeModel = {
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

    async getCitizenshipStats() {
        try {
            const result = await pool.query(`
                SELECT topic, COUNT(*) as count
                FROM clients
                WHERE topic IN ('German Citizenship', 'Austrian Citizenship', 'Polish Citizenship')
                GROUP BY topic
            `);
            return result.rows;
        } catch (error) {
            console.error("❌ Error fetching citizenship statistics:", error);
            throw error;
        }
    }
};

module.exports = HomeModel;
