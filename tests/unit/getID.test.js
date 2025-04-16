// tests/unit/getById.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('GetByID /v1/fragments', () => {
    test('Split Id with right extension', async () => {
        const response = await request(app)
            .get('/v1/fragments/12345.txt')
            .auth('user1@email.com', 'password1');

        expect(response.status).not.toBe(415);
    });

    test('Split Id with wrong extension', async () => {
        const createFragmentResponse = await request(app)
            .post('/v1/fragments')
            .auth('user1@email.com', 'password1')
            .set('content-type', 'text/plain')
            .send("This is data");

        expect(createFragmentResponse.status).toBe(201);

        const id = JSON.parse(createFragmentResponse.text).fragments.id;
        const retrieveFragmentResponse = await request(app)
            .get(`/v1/fragments/${id}.html`)
            .auth('user1@email.com', 'password1');

        expect(retrieveFragmentResponse.status).toBe(415);
    });

    test('Unauthenticated requests are denied', () => {
        return request(app).get('/v1/fragments').expect(401);
    });

    test('Incorrect credentials are denied', () => {
        return request(app)
            .get('/v1/fragments')
            .auth('invalid@email.com', 'incorrect_password')
            .expect(401);
    });

    test('Authenticated users get a fragments array with Incorrect ID', async () => {
        const id = 1;
        const res = await request(app)
            .get(`/v1/fragments${id}`)
            .auth('user1@email.com', 'password1');

        expect(res.status).toBe(404);
    });

    test('Authenticated users get a fragments array with Correct ID', async () => {
        const res = await request(app)
            .post('/v1/fragments')
            .auth('user1@email.com', 'password1')
            .set('content-type', 'text/plain')
            .send("This is data");

        const id = JSON.parse(res.text).fragments.id;
        const res2 = await request(app)
            .get(`/v1/fragments/${id}`)
            .auth('user1@email.com', 'password1');

        expect(res2.status).toBe(200);
    });

    test('Fragment with Markdown Format is Converted to HTML', async () => {
        const createFragmentResponse = await request(app)
            .post('/v1/fragments')
            .auth('user1@email.com', 'password1')
            .set('content-type', 'text/markdown')
            .send("# This is a Markdown Title");

        expect(createFragmentResponse.status).toBe(201);

        const id = JSON.parse(createFragmentResponse.text).fragments.id;
        const retrieveFragmentResponse = await request(app)
            .get(`/v1/fragments/${id}.html`)
            .auth('user1@email.com', 'password1');

        expect(retrieveFragmentResponse.status).toBe(200);
    });

    test('Fragment with Invalid extension', async () => {
        const createFragmentResponse = await request(app)
            .post('/v1/fragments')
            .auth('user1@email.com', 'password1')
            .set('content-type', 'text/plain')
            .send("This is data");

        expect(createFragmentResponse.status).toBe(201);

        const id = JSON.parse(createFragmentResponse.text).fragments.id;
        const retrieveFragmentResponse = await request(app)
            .get(`/v1/fragments/${id}.invalid`)
            .auth('user1@email.com', 'password1');

        expect(retrieveFragmentResponse.status).toBe(415);
    });

    test('Conversion of Images', async () => {
        const createFragmentResponse = await request(app)
            .post('/v1/fragments')
            .auth('user1@email.com', 'password1')
            .set('content-type', 'image/png')
            .send("fakeImageData");

        expect(createFragmentResponse.status).toBe(201);

        const id = JSON.parse(createFragmentResponse.text).fragments.id;
        const retrieveFragmentResponse = await request(app)
            .get(`/v1/fragments/${id}.jpg`)
            .auth('user1@email.com', 'password1');

        expect(retrieveFragmentResponse.status).toBe(500);
     
    });
});