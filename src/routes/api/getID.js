// src/routes/api/get-id.js
const Fragment = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const extension = req.params.ext;
    const fragment = await Fragment.Fragment.byId(req.user, req.params.id);

    if (!fragment) {
      return res.status(404).json({ 
        status: 'error',
            error: { 
              code: 404,
              message: 'Fragment not found'
              }
        });
  }

  let data;
  try {
    data = extension
      ? await fragment.convertFragment(extension)
      : await fragment.getData();
  } catch (error) {
    // If getData() fails, return a 404 instead of falling into the catch block
    return res.status(404).json({
      status: 'error',
      error: {
        code: 404,
        message: 'An error occurred while retrieving fragment data',
      },
    });
  }

    logger.debug(fragment.mimeType, 'Fragment type');
    res.setHeader('Content-Type', fragment.type);
    res.setHeader('Content-Length', fragment.size);
    return res.status(200).send(data);
  } catch (err) {
    console.error('Error fetching fragment:', err);
    res.status(500).json({
      status: 'error',
      error: {
        code: 500,
        message: 'An error occurred while fetching the fragment',
      },
  });
    
  }
};
