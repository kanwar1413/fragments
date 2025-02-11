const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  // Extract the authenticated user ID (ownerId) and fragment ID from request parameters
  const { user: ownerId } = req;
  const { id } = req.params;

  try {
    // Log the attempt to fetch the fragment by its ID
    logger.info(`Fetching fragment by ID: ${id}`);

    // Attempt to fetch the fragment associated with the user and ID
    const fragment = await Fragment.byId(ownerId, id);

    // If the fragment is not found, log a warning and return a 404 response
    if (!fragment) {
      logger.warn(`Fragment not found for ID: ${id}`);
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    try {
      // Attempt to retrieve the actual fragment data (instead of just metadata)
      const data = await fragment.getData();

      // Set the appropriate Content-Type header based on the fragment's type
      res.setHeader('Content-Type', fragment.type);

      // Set the Content-Length header based on the fragment's size
      res.setHeader('Content-Length', fragment.size);

      // Send the fragment data back in the response body
      res.status(200).send(data);

      // Log a successful response indicating the fragment data was sent
      logger.info(`Successfully sent fragment data for ID: ${id}`);
    } catch (dataError) {
      // Log any errors encountered when retrieving fragment data
      logger.error(`Error retrieving fragment data with ID ${id}: ${dataError.message}`, { error: dataError });

      // Return a 404 error if there was an issue with retrieving the fragment data
      res.status(404).json(createErrorResponse(404, 'An error occurred while retrieving fragment data'));
    }
  } catch (error) {
    // Log any errors encountered while fetching the fragment
    logger.error(`Error fetching fragment with ID ${id}: ${error.message}`, { error });

    // Return a 500 error indicating an issue with fetching the fragment
    res.status(500).json(createErrorResponse(500, 'An error occurred while fetching the fragment'));
  }
};
