const pool = require('./db.js'); // Import database connection

const HomeModel = {
    async getMeetingsForCurrentWeek() {
        try {
            const result = await pool.query(`
                SELECT meetings.*, clients.name AS client_name, clients.email AS client_email 
                FROM meetings 
                JOIN clients ON meetings.client_id = clients.id 
                WHERE meetings.datetime >= CURRENT_DATE
                AND meetings.datetime < CURRENT_DATE + INTERVAL '7 days'
                ORDER BY meetings.datetime ASC
            `);
            return result.rows;
        } catch (error) {
            console.error("❌ Error fetching weekly meetings:", error);
            throw error;
        }
    },
    async getCitizenshipStats() {
        try {
            const result = await pool.query(`
                SELECT topic, COUNT(*) AS count
                FROM clients
                WHERE topic IN ('German Citizenship', 'Austrian Citizenship', 'Polish Citizenship')
                GROUP BY topic;
            `);
            
            // Convert rows into a structured object
            const stats = { "German Citizenship": 0, "Austrian Citizenship": 0, "Polish Citizenship": 0 };
            result.rows.forEach(row => {
                stats[row.topic] = parseInt(row.count);
            });

            console.log("📊 Citizenship Statistics:", stats);
            return stats;
        } catch (error) {
            console.error("❌ Error fetching citizenship statistics:", error);
            throw error;
        }
    }
};

module.exports = HomeModel;
