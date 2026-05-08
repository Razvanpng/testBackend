const request = require('supertest');
const app = require('./app');
const db = require('./db');

afterAll(async () => {
    await db.end();
});

describe('GET /api/products', () => {
    it('intoarce toate produsele cu status 200', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('intoarce 400 cand category_id este text', async () => {
        const res = await request(app).get('/api/products?category_id=abc');
        expect(res.statusCode).toEqual(400);
    });

    it('intoarce 400 cand category_id este numar negativ', async () => {
        const res = await request(app).get('/api/products?category_id=-5');
        expect(res.statusCode).toEqual(400);
    });
});