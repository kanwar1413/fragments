const request = require('supertest');
const app = require('../../src/app');

describe('PUT /v1/fragments', () => {
  let fragmentId;

  // If the request is missing the Authorization header, it should be forbidden
  test('authenticated users post a fragments array with a supported type', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('Testing');

    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.status).toBe('ok');
    // Add this log to check the structure
    console.log('Response body:', postRes.body);
      
    // Update this line based on your actual response structure
    fragmentId = postRes.body.fragments.id;
  });

  test('user trying to update the fragment', async () => {
    const updateRes = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('Updated-data');

    expect(updateRes.statusCode).toBe(200);
  });

  test('user trying to update with wrong type fragment', async () => {
    const updateRes = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/html')
      .send('Updated-data');

    expect(updateRes.statusCode).toBe(400);
  });

  test('user trying to update with invalid fragment', async () => {
    const updateRes = await request(app)
      .put(`/v1/fragments/invalidId`)
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/html')
      .send('Updated-data');

    expect(updateRes.statusCode).toBe(404);
  });
});