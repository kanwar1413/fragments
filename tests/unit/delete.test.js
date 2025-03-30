const request = require('supertest');
const express = require('express');
const { Fragment } = require('../../src/model/fragment');
const deleteRoute = require('../../src/routes/api/delete');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.user = { id: 'ownerId' };
  next();
});

app.use('/v1/fragment', deleteRoute);

jest.mock('../../src/model/fragment');

describe('DELETE /v1/fragment/:id', () => {
  test('basic test', () => {
    expect(true).toBe(true);
  });
  describe('DELETE /v1/fragment/:id', () => {
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

    test('should delete a fragment when found', async () => {
      Fragment.byId.mockResolvedValue(mockFragment);
      Fragment.delete.mockResolvedValue();

      const response = await request(app)
        .delete('/v1/fragment/06dbf21a-52c0-4d03-87a9-8d567bd8673e');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'Fragment deleted',
      });
    });

    test('should return 404 if fragment not found', async () => {
      Fragment.byId.mockResolvedValue(null);

      const response = await request(app)
        .delete('/v1/fragment/invalid-id');

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
        .delete('/v1/fragment/06dbf21a-52c0-4d03-87a9-8d567bd8673e');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        error: {
          code: 500,
          message: 'An error occurred while fetching the fragment',
        },
      });
    });
  });
});