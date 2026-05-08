const request = require('supertest');
const app = require('./app');
const db = require('./db');

afterAll(async () => {
    await db.end();
});

describe('POST /api/orders', () => {
    it('creeaza o comanda cu succes si calculeaza totalul', async () => {
        const orderData = {
            product_id: 1,
            quantity: 1,
            customer_email: "client@exemplu.ro"
        };

        const res = await request(app)
            .post('/api/orders')
            .send(orderData);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('order_id');
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('created_at');
    });

    it('intoarce 400 pentru stoc insuficient', async () => {
        const orderData = {
            product_id: 1,
            quantity: 999999, // o cantitate imensa care sigur depaseste stocul
            customer_email: "client@exemplu.ro"
        };

        const res = await request(app)
            .post('/api/orders')
            .send(orderData);

        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual('stoc insuficient');
    });

    it('intoarce 404 pentru produs inexistent', async () => {
        const orderData = {
            product_id: 99999,
            quantity: 1,
            customer_email: "client@exemplu.ro"
        };

        const res = await request(app)
            .post('/api/orders')
            .send(orderData);

        expect(res.statusCode).toEqual(404);
    });

    it('intoarce 400 pentru date invalide (email incorect)', async () => {
        const orderData = {
            product_id: 1,
            quantity: 1,
            customer_email: "email-fara-aron.com"
        };

        const res = await request(app)
            .post('/api/orders')
            .send(orderData);

        expect(res.statusCode).toEqual(400);
    });
});