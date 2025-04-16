const { Fragment } = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');
const md = require('markdown-it')();
const sharp = require('sharp');

module.exports = async (req, res) => {
    try {
        const id = req.params.id.split('.')[0];
        const user = req.user;
        const fragment_data = await Fragment.byId(user, id);
        if (!fragment_data) {
          return createErrorResponse(
            res.status(404).json({
              code: 404,
              message: 'Fragment not found',
            })
          );
        }
        const extension = req.params.id.split('.')[1];
        const format = getContentType(extension, fragment_data.mimeType);

        if (!fragment_data.formats.includes(format)) {
            return createErrorResponse(
                res.status(415).json({
                    message: "Invalid type conversion",
                })
            );
        }

        const dataResult = await fragment_data.getData();
        let dataToSend = dataResult;

        if (isValidConversion(extension)) {
            try{
            dataToSend = await  convertData(dataResult, format);
            }catch{
                return createErrorResponse(
                    res.status(500).json({
                        code: 500,
                        message: 'No data Found',
                    })
                );
            }
        } 

        res.setHeader('Content-Type', format);
        return createSuccessResponse(res.status(200).send(dataToSend));
    } catch{
        
            return createErrorResponse(
                res.status(404).json({
                    code: 404,
                    message: 'No data Found',
                })
            );
        
    }
};

function getContentType(extension, mimeType) {
    
    const extensionToContentType = {
        'txt': 'text/plain',
        'md': 'text/markdown',
        'html': 'text/html',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'webp': 'image/webp',
        'gif': 'image/gif',

    };
    if (extension && !Object.prototype.hasOwnProperty.call(extensionToContentType, extension)) {
        return 'Invalid';
    }

    // Check if the extension is valid, otherwise, use the provided MIME type
    return extensionToContentType[extension] || mimeType;
}

function isValidConversion(extension) {
    const validExtensions = ['txt', 'md', 'html', 'json', 'png', 'jpg', 'webp', 'gif'];
    return validExtensions.includes(extension);
}

async function  convertData(data, contentType) {
    if (contentType === 'text/html') {
        return md.render(data.toString());
    }else if (contentType === 'image/png') {
        return await sharp(data).png().toBuffer();
              } else if (contentType === 'image/jpeg') {
                return await sharp(data).jpeg().toBuffer();
              } else if (contentType === 'image/gif') {
                return await sharp(data).gif().toBuffer();
              } else if (contentType === 'image/webp') {
                return await sharp(data).webp().toBuffer();
              }
     else {
        // For text/plain and other types, return the data as is
        return data;
     }
}