const express = require('express');
const ClientModel = require('../models/clientModel.js');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const clients = await ClientModel.getAllClients();
        res.render('clients', { clients });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

router.post('/add', async (req, res) => {
    const { name, email, phone, description, topic } = req.body;
    try {
        await ClientModel.addClient(name, email, phone, description, topic);
        res.redirect('/clients');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error inserting client");
    }
});

router.put('/update/:id', async (req, res) => {
    const clientId = req.params.id;
    const { name, email, phone, description, topic } = req.body;

    try {
        const updatedClient = await ClientModel.updateClient(clientId, name, email, phone, description, topic);
        if (!updatedClient) return res.status(404).json({ error: "Client not found." });

        res.status(200).json({ message: "Client updated successfully!", client: updatedClient });
    } catch (error) {
        res.status(500).json({ error: "Error updating client." });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const clientId = req.params.id;
    try {
        await ClientModel.deleteClient(clientId);
        res.status(200).json({ message: "Client deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting client." });
    }
});

module.exports = router;
