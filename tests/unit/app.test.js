const request = require('supertest');

const app = require('../../src/app');

describe('404 handler', () => {
    test('handle any requests for resources that can\'t be found ', async () => {
        const res = await request(app).get('/nonexistent-route');
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
          status: 'error',
          error: {
            message: 'not found',
            code: 404,
          },
        });
      });
    });