// src/routes/index.js

const { hostname } = require('os');
const express = require('express');

// version and author from package.json
const { version } = require('../../package.json');

// Our authentication middleware
const { authenticate } = require('../auth');
const { createSuccessResponse } = require('../response');

// Create a router that we can use to mount our API
const router = express.Router();


/**
 * Expose all of our API routes on /v1/* to include an API version.
 * Protect them all with middleware so you have to be authenticated
 * in order to access things.
 */
router.use(`/v1`, authenticate(), require('./api'));
/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      // TODO: make sure these are changed for your name and repo
      author: 'KANWAR PREET KAUR',
      githubUrl: 'https://github.com/kanwar1413/fragments',
      version,
      // Include the hostname in the response
      hostname: hostname(),
    })
  );
});


module.exports = router;