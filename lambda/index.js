const fs = require('fs');
const path = require('path');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

exports.handler = async (event) => {
  try {
    let requestPath = event.rawPath || '/';
    
    if (requestPath === '/') {
      requestPath = '/index.html';
    }
    
    const filePath = path.join(__dirname, requestPath.substring(1));
    
    if (!fs.existsSync(filePath)) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/html' },
        body: '<h1>404 - File Not Found</h1>'
      };
    }
    
    const fileContent = fs.readFileSync(filePath);
    const fileExtension = path.extname(filePath);
    const contentType = mimeTypes[fileExtension] || 'application/octet-stream';
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
      },
      body: fileContent.toString(contentType.startsWith('image/') ? 'base64' : 'utf8'),
      isBase64Encoded: contentType.startsWith('image/')
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: '<h1>500 - Internal Server Error</h1>'
    };
  }
};