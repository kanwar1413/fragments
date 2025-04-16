const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  const frag_id = req.params.id;

  try {
    const fragment = await Fragment.byId(req.user, frag_id);

    // If no fragment found, return 404
    if (!fragment) {
      return res.status(404).json(
        createErrorResponse(404, {
          message: 'Fragment not found',
        })
      );
    }

    const originalType = fragment.type;
    const updateType = req.get('Content-Type');

    // If type matches, allow update
    if (originalType === updateType) {
      await fragment.setData(req.body);

      return res.status(200).json(
        createSuccessResponse({
          status: 'ok',
          fragment,
        })
      );
    }

    // Type mismatch — return 400
    return res.status(400).json(
      createErrorResponse(400, {
        message: "A fragment's type cannot be changed after it is created",
      })
    );
  } catch (err) {
    console.error('PUT error:', err);

    return res.status(500).json(
      createErrorResponse(500, {
        message: 'Internal Server Error',
      })
    );
  }
};
