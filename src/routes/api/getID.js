const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * Handle GET requests for fragments, with optional format conversion
 */
module.exports = async (req, res) => {
  const { user: ownerId } = req;
  const { id, ext } = req.params;  // The extension will be parsed from the route params

  try {
    logger.info(`Fetching fragment by ID: ${id}${ext ? ` with conversion to ${ext}` : ''}`);

    // Get the fragment metadata
    const fragment = await Fragment.byId(ownerId, id);

    if (!fragment) {
      logger.warn(`Fragment not found for ID: ${id}`);
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    try {
      // If no extension is provided, return the fragment in its original format
      if (!ext) {
        try {
          const data = await fragment.getData();
          
          // Set content type and length headers
          res.setHeader('Content-Type', fragment.type);
          res.setHeader('Content-Length', fragment.size);
          
          // Send the data
          return res.status(200).send(data);
        } catch{
          logger.warn(`Fragment data not found for ID: ${id}`);
          return res.status(404).json(createErrorResponse(404, 'An error occurred while retrieving fragment data'));
        }
      }
      
      // Rest of the code remains the same...
      
      // Handle conversion based on the requested extension
      // First check if the conversion is supported
      if (!fragment.isSupportedConversion(ext)) {
        logger.warn(`Unsupported conversion from ${fragment.type} to ${ext} for fragment ${id}`);
        return res.status(415).json(
          createErrorResponse(415, `Conversion from ${fragment.type} to ${ext} is not supported`)
        );
      }
      
      // Get the converted data
      const convertedData = await fragment.getConvertedData(ext);
      
      // Determine the content type for the converted data
      const convertedType = getConvertedContentType(fragment.type, ext);
      
      // Set content headers
      res.setHeader('Content-Type', convertedType);
      
      // For binary data like images, don't set Content-Length as it might change after conversion
      if (!convertedType.startsWith('image/')) {
        res.setHeader('Content-Length', Buffer.byteLength(convertedData));
      }
      
      // Send the converted data
      logger.info(`Successfully sent converted fragment (${ext}) for ID: ${id}`);
      return res.status(200).send(convertedData);
      
    } catch (dataError) {
      logger.error(`Error retrieving fragment data with ID ${id}: ${dataError.message}`, { error: dataError });
      return res.status(500).json(
        createErrorResponse(500, 'An error occurred while retrieving or converting fragment data')
      );
    }
  } catch (error) {
    logger.error(`Error fetching fragment with ID ${id}: ${error.message}`, { error });
    return res.status(500).json(
      createErrorResponse(500, 'An error occurred while fetching the fragment')
    );
  }
};

/**
 * Helper function to determine the content type for converted data
 */
function getConvertedContentType(originalType, extension) {
  // Map of extensions to content types
  const extensionToContentType = {
    'txt': 'text/plain',
    'html': 'text/html',
    'md': 'text/markdown',
    'json': 'application/json',
    'yaml': 'application/yaml',
    'yml': 'application/yaml',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp',
    'gif': 'image/gif',
    'avif': 'image/avif',
    'csv': 'text/csv'
  };
  
  // Return the appropriate content type based on the extension
  return extensionToContentType[extension] || originalType;
}