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

app.post('/api/orders', async (req, res) => {
    const { product_id, quantity, customer_email } = req.body;

    if (!Number.isInteger(product_id) || product_id <= 0) {
        return res.status(400).json({ error: "product_id trebuie sa fie un intreg pozitiv" });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ error: "quantity trebuie sa fie un intreg strict pozitiv" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customer_email || typeof customer_email !== 'string' || customer_email.length > 150 || !emailRegex.test(customer_email)) {
        return res.status(400).json({ error: "customer_email invalid" });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [productRows] = await connection.query(
            'SELECT price, stock FROM products WHERE id = ? FOR UPDATE', 
            [product_id]
        );

        if (productRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "produsul nu a fost gasit" });
        }

        const product = productRows[0];

        if (product.stock < quantity) {
            await connection.rollback();
            return res.status(400).json({ error: "stoc insuficient", stoc_disponibil: product.stock });
        }

        const total = parseFloat((product.price * quantity).toFixed(2));

        const [insertResult] = await connection.query(
            'INSERT INTO orders (product_id, quantity, customer_email, total) VALUES (?, ?, ?, ?)',
            [product_id, quantity, customer_email, total]
        );

        await connection.query(
            'UPDATE products SET stock = stock - ? WHERE id = ?',
            [quantity, product_id]
        );

        await connection.commit();

        const [orderRows] = await connection.query('SELECT created_at FROM orders WHERE id = ?', [insertResult.insertId]);

        res.status(201).json({
            order_id: insertResult.insertId,
            product_id: product_id,
            quantity: quantity,
            total: total,
            created_at: orderRows[0].created_at
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: "eroare interna la procesarea comenzii" });
    } finally {
        connection.release();
    }
});

module.exports = app;