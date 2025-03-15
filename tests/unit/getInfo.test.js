const request = require('supertest');
const express = require('express');
const { Fragment } = require('../../src/model/fragment');
const getByIdRoute = require('../../src/routes/api/getInfo');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.user = { id: 'ownerId' };
  next();
});

app.use('/v1/fragment', getByIdRoute);

jest.mock('../../src/model/fragment');

describe('GET /v1/fragment/:id/info', () => {
  const mockFragmentData = Buffer.from('fragment data');
  const currentDate = new Date().toISOString(); // Using current date for created/updated

  const mockFragment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    ownerId: 'ownerId',
    created: currentDate,
    updated: currentDate,
    size: 14,
    getData: jest.fn().mockResolvedValue(mockFragmentData),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return a fragment when found', async () => {
    Fragment.byId.mockResolvedValue(mockFragment);

    const response = await request(app)
      .get('/v1/fragment/123e4567-e89b-12d3-a456-426614174000/info');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      fragment: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ownerId: 'ownerId',
        created: currentDate,
        updated: currentDate,
        size: 14,
      },
    });
  });

  test('should return 404 if fragment not found', async () => {
    Fragment.byId.mockResolvedValue(null);

    const response = await request(app)
      .get('/v1/fragment/invalid-id/info');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: 'Fragment not found',
      },
    });
  });

  test('should return 500 on error', async () => {
    const errorMessage = 'Database connection error';
    Fragment.byId.mockRejectedValue(new Error(errorMessage));

    const response = await request(app)
      .get('/v1/fragment/123e4567-e89b-12d3-a456-426614174000/info');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 500,
        message: 'An error occurred while fetching the fragment metadata',
      },
    });
  });
});
