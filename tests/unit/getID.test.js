const request = require('supertest');
const express = require('express');
const { Fragment } = require('../../src/model/fragment');
const getByIdRoute = require('../../src/routes/api/getID');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.user = { id: 'ownerId' };
  next();
});

app.use('/v1/fragment', getByIdRoute);

jest.mock('../../src/model/fragment');

describe('GET /v1/fragment/:id', () => {
  const mockFragmentData = Buffer.from('fragment data');
  const currentDate = new Date().toISOString();
  const mockFragment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    ownerId: 'ownerId',
    created: currentDate,
    updated: currentDate,
    type: 'text/plain',
    size: 13,
    getData: jest.fn().mockResolvedValue(mockFragmentData),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return a fragment when found', async () => {
    Fragment.byId.mockResolvedValue(mockFragment);

    const response = await request(app)
      .get('/v1/fragment/123e4567-e89b-12d3-a456-426614174000');

    expect(response.status).toBe(200);
  });

  test('should return 404 if fragment not found', async () => {
    Fragment.byId.mockResolvedValue(null);

    const response = await request(app)
      .get('/v1/fragment/987f6543-e21c-4b56-98a1-123456789abc');

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
      .get('/v1/fragment/123e4567-e89b-12d3-a456-426614174000');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 500,
        message: 'An error occurred while fetching the fragment',
      },
    });
  });

  test('should return the fragment data with the correct Content-Type and Content-Length headers', async () => {
    Fragment.byId.mockResolvedValue(mockFragment);

    const response = await request(app)
      .get('/v1/fragment/123e4567-e89b-12d3-a456-426614174000');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/plain');
    expect(response.headers['content-length']).toBe('13');
    expect(response.text).toBe('fragment data');
  });

  test('should return the correct fragment data when the ID matches', async () => {
    Fragment.byId.mockResolvedValue(mockFragment);

    const response = await request(app)
      .get('/v1/fragment/123e4567-e89b-12d3-a456-426614174000');

    expect(response.status).toBe(200);
  });

  // New test case to cover getData() error handling
  test('should return 404 when getData() fails', async () => {
    const mockFragmentWithDataError = {
      ...mockFragment,
      getData: jest.fn().mockRejectedValue(new Error('Failed to retrieve data')),
    };

    Fragment.byId.mockResolvedValue(mockFragmentWithDataError);

    const response = await request(app)
      .get('/v1/fragment/123e4567-e89b-12d3-a456-426614174000');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: 'An error occurred while retrieving fragment data',
      },
    });
  });
});
