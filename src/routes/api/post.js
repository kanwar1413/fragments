const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const contentType = require('content-type');
const { randomUUID } = require('crypto');

module.exports = async (req, res) => {
  if (!Buffer.isBuffer(req.body) || !req.headers['content-type']) {
    return res.status(400).json(createErrorResponse(400, 'Invalid or missing Content-Type'));
  }

  const { type } = contentType.parse(req);
  if (!Fragment.isSupportedType(type)) {
    return res.status(415).json(createErrorResponse(415, `Unsupported Content-Type: ${type}`));
  }

  try {
    const id = randomUUID();
    const created = new Date().toISOString();

    const fragment = new Fragment({ id, type, size: req.body.length });
    await fragment.save();
    await fragment.setData(req.body);

    // Use API_URL if defined; fallback to request host
    const apiUrl = process.env.API_URL || `http://${req.headers.host}`;
    const locationUrl = new URL(`/v1/fragments/${id}`, apiUrl).toString();

    res.status(201)
      .location(locationUrl)
      .json(createSuccessResponse({
        id,
        created,
        type,
        size: req.body.length,
        location: locationUrl,
      }));
  } catch (error) {
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
