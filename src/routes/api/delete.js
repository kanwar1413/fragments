// src/routes/api/delete.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
    const { user: ownerId } = req;
    const { id } = req.params;
  
    try {
      logger.info(`Fetching fragment by ID: ${id}`);
  
      let fragment;
      try {
        fragment = await Fragment.byId(ownerId, id); // Try to fetch fragment
      } catch (error) {
        // If the fragment is not found, error will be thrown
        logger.warn(`Fragment not found for ID: ${id}`);
        return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
      }
  
      // If fragment is found, proceed to delete it
      await Fragment.delete(ownerId, id); // Delete fragment metadata and data
      logger.debug(id, 'Fragment deleted');
      
      return res.status(200).json(createSuccessResponse({ message: 'Fragment deleted' }));
    } catch (error) {
      logger.error(`Error fetching fragment with ID ${id}: ${error.message}`, { error });
      return res.status(500).json(createErrorResponse(500, 'An error occurred while fetching the fragment'));
    }
  };