const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment'); // Assuming the file path is correct

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const { expand } = req.query;
    const ownerId = req.user; // Assuming `req.user` contains the authenticated user's hashed email

    // Fetch fragments based on the `expand` query parameter
    const fragments = await Fragment.byUser(ownerId, expand === 'true');

    res.status(200).json(
      createSuccessResponse({
        status: 'ok',
        fragments,
      })
    );
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
