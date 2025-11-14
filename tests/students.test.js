// tests/students.test.js
const request = require('supertest');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'students.db');
// use a separate DB for tests if you want; here we'll remove any existing DB so tests are deterministic
try { fs.unlinkSync(dbPath); } catch (e) {}

const app = require('../server');

describe('Students API', () => {
  let createdId;

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /students returns array (seeded)', async () => {
    const res = await request(app).get('/students');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /students creates student', async () => {
    const payload = { name: 'Test Student', email: 'test@example.com', age: 18 };
    const res = await request(app).post('/students').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(payload.name);
    createdId = res.body.id;
  });

  test('GET /students/:id returns created student', async () => {
    const res = await request(app).get(`/students/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Test Student');
  });

  test('PUT /students/:id updates student', async () => {
    const res = await request(app).put(`/students/${createdId}`).send({ name: 'Updated Name' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Name');
  });

  test('DELETE /students/:id deletes student', async () => {
    const res = await request(app).delete(`/students/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });
});
