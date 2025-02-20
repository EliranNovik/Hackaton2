const pool = require('./db.js'); // Import database connection

const ClientModel = {
    // Get all clients
    async getAllClients() {
        try {
            const result = await pool.query('SELECT * FROM clients ORDER BY id DESC');
            return result.rows;
        } catch (error) {
            console.error("Error fetching clients:", error);
            throw error;
        }
    },

    // Search clients by name or email
    async searchClients(searchTerm) {
        try {
            const result = await pool.query(
            "SELECT * FROM clients WHERE LOWER(name) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1)",
            [`%${searchTerm}%`]
        );
            return result.rows;
        } catch (error) {
            console.error("❌ Error searching clients:", error);
            throw error;
        }
    },


    // Add a new client
    async addClient(name, email, phone, description, topic) {
        try {
            const result = await pool.query(
                'INSERT INTO clients (name, email, phone, description, topic) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [name, email, phone, description, topic]
            );
            return result.rows[0];
        } catch (error) {
            console.error("Error inserting client:", error);
            throw error;
        }
    },

    // Get a specific client by ID
    async getClientById(clientId) {
        try {
            const result = await pool.query('SELECT * FROM clients WHERE id = $1', [clientId]);
            return result.rows[0];
        } catch (error) {
            console.error("Error fetching client by ID:", error);
            throw error;
        }
    },

    // Update a client
    async updateClient(clientId, name, email, phone, description, topic) {
        try {
            const result = await pool.query(
                'UPDATE clients SET name = $1, email = $2, phone = $3, description = $4, topic = $5 WHERE id = $6 RETURNING *',
                [name, email, phone, description, topic, clientId]
            );
            return result.rows[0];
        } catch (error) {
            console.error("Error updating client:", error);
            throw error;
        }
    },

    // Delete a client
    async deleteClient(clientId) {
        try {
            await pool.query('DELETE FROM clients WHERE id = $1', [clientId]);
            return { message: "Client deleted successfully" };
        } catch (error) {
            console.error("Error deleting client:", error);
            throw error;
        }
    }
};

module.exports = ClientModel;
