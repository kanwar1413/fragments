const request = require('supertest');
const app = require('../../src/app'); // Ensure this points to your Express app

describe('POST /v1/fragments', () => {
  test('unauthenticated requests are denied', async () => {
    const res = await request(app).post('/v1/fragments');
    expect(res.statusCode).toBe(401); // Assuming you have middleware for authentication
  });

  test('authenticated users can create a plain text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1') // Ensure this matches your authentication setup
      .set('Content-Type', 'text/plain')
      .set('x-owner-id', 'user1@email.com') // Set the ownerId in the headers
      .send('Hello, Fragment!');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toHaveProperty('id');
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment.size).toBe('Hello, Fragment!'.length);
  });

  test('POST response includes a Location header with a full URL', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .set('x-owner-id', 'user1@email.com') // Set the ownerId in the headers
      .send('Test content');

    expect(res.statusCode).toBe(201);
    expect(res.headers).toHaveProperty('location');
    const locationUrl = new URL(res.headers.location);
    expect(locationUrl.pathname).toMatch(/\/v1\/fragments\/[0-9a-fA-F-]+$/); // Check if the path matches the fragment ID format
  });

  test('unsupported Content-Type returns 415 error', async () => {
    const res = await request(app)
    .post('/v1/fragments')
    .auth('user1@email.com', 'password1') // Ensure this matches your authentication setup
    .set('Content-Type', 'application/unknown') // Use an unsupported content type
    .set('x-owner-id', 'user1@email.com') // Set the ownerId in the headers
    .send('Unsupported content');

    expect(res.statusCode).toBe(415);
    expect(res.body.error).toContain('Unsupported content type');
  });

  test('invalid or missing ownerId returns 400', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Hello, Fragment!');

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Missing ownerId in request headers');
  });

  test('invalid or missing fragment body returns 400', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .set('x-owner-id', 'user1@email.com') // Set the ownerId in the headers
      .send(''); // Sending an empty body

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Invalid or unsupported content type');
  });
});