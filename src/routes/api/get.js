const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  // Log the user's information who made the GET request
  logger.info(`Received GET request from user ${req.user}`);

  // Check if the 'expand' query parameter is set to '1', which indicates a request for expanded fragment details
  const expandFlag = req.query['expand'] === '1';

  // Extract the user ID (ownerId) from the authenticated user object
  const { user: ownerId } = req;

  try {
    // Log the attempt to fetch fragments for the given user
    logger.debug('Attempting to fetch fragments for user:', ownerId);

    // Fetch all fragments associated with the current user, considering the 'expand' flag
    const fragments = await Fragment.byUser(ownerId, expandFlag);

    // Log the number of fragments found for the user
    logger.info(`Found ${fragments.length} fragments for user ${ownerId}`);

    // Send a successful response containing the fragments in the response body
    res.status(200).json(createSuccessResponse({ fragments: [...fragments] }));

    // Log the successful retrieval of fragments
    logger.info(`Successfully fetched fragments for user ${ownerId}`);
  } catch (error) {
    // Log an error if something goes wrong during the fetching process
    logger.error(`Error occurred while fetching fragments for user ${ownerId}: ${error.message}`);

    // Send an error response with status code 500 and the error message
    res.status(500).json(createErrorResponse(500, error.message));
  }
};
