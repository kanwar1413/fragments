const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  test('unauthenticated requests are denied', () => {
    return request(app).post('/v1/fragments').expect(401);
  });

  test('authenticated users can create a plain text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Hello, Fragment!');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('id');
    expect(res.body.type).toBe('text/plain');
    expect(res.body.size).toBe('Hello, Fragment!'.length);
  });

  test('POST response includes a Location header with a full URL', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Test content');

    expect(res.statusCode).toBe(201);
    expect(res.headers).toHaveProperty('location');
    expect(new URL(res.headers.location)).toBeInstanceOf(URL);
  });

  test('unsupported Content-Type returns 415 error', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/unknown')
      .send('Unsupported content');

    expect(res.statusCode).toBe(415);
    expect(res.body.error.message).toContain('Unsupported Content-Type');
  });
});
