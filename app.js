const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

app.get('/api/products', async (req, res) => {
    try {
        const categoryId = req.query.category_id;
        let query = `
            SELECT p.id, p.name, p.price, p.stock, p.category_id, c.name as category_name 
            FROM products p 
            JOIN categories c ON p.category_id = c.id
        `;
        const params = [];

        if (categoryId !== undefined) {
            const parsedId = parseInt(categoryId, 10);
            if (isNaN(parsedId) || parsedId <= 0 || String(parsedId) !== String(categoryId)) {
                return res.status(400).json({ error: "category_id invalid" });
            }
            query += ` WHERE p.category_id = ?`;
            params.push(parsedId);
        }

        const [rows] = await db.query(query, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "eroare interna" });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const parsedId = parseInt(id, 10);

        if (isNaN(parsedId) || parsedId <= 0 || String(parsedId) !== String(id)) {
            return res.status(400).json({ error: "id invalid" });
        }

        const query = `
            SELECT p.id, p.name, p.price, p.stock, p.category_id, c.name as category_name, p.created_at 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ?
        `;
        
        const [rows] = await db.query(query, [parsedId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "produsul nu a fost gasit" });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "eroare interna" });
    }
});

module.exports = app;