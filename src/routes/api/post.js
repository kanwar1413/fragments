// Required dependencies
const express = require('express');
const router = express.Router();
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const crypto = require('crypto');

// POST route handler for /fragments
router.post('/fragments', async (req, res) => {
  try {
    // Check if the request body is a Buffer
    if (!Buffer.isBuffer(req.body)) {
      return res.status(415).json({ error: 'Unsupported content type' });
    }

    // Check if the body is empty
    if (req.body.length === 0) {
      return res.status(400).json({ error: 'Invalid or unsupported content type' });
    }

    // Parse the Content-Type header
    const { type } = contentType.parse(req);

    // Extract ownerId from the request headers
    const ownerId = req.headers['x-owner-id'];
    if (!ownerId) {
      return res.status(400).json({ error: 'Missing ownerId in request headers' });
    }

    // Validate the content type for supported types
    if (!Fragment.isSupportedType(type)) {
      return res.status(415).json({ error: `Unsupported content type: ${type}` });
    }

    // Generate a random ID using crypto (instead of uuid)
    const id = crypto.randomBytes(16).toString('hex'); // This generates a 32-character hex string

    // Create a new fragment instance
    const fragment = new Fragment({
      ownerId,
      id,
      type,
      size: req.body.length,
    });

    // Save the fragment metadata and data
    await fragment.save();
    await fragment.setData(req.body);

    // Generate Location header for the newly created resource
    const fragmentUrl = `${req.protocol}://${req.get('host')}/v1/fragments/${fragment.id}`;

    res.status(201)
      .set('Location', fragmentUrl)
      .json({
        status: 'ok',
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          updated: fragment.updated,
          type: fragment.type,
          size: fragment.size,
        },
      });
  } catch (err) {
    console.error('Error handling request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
