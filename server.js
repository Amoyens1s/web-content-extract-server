const express = require('express');
const { extractContent } = require('web-content-extract');

const app = express();
const PORT = 8030;
const HOST = '0.0.0.0';

// Middleware to parse query parameters
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Validate URL format
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Main route for content extraction
app.get('/extract', async (req, res) => {
  try {
    const { url, seo = true, format = 'markdown' } = req.query;
    
    // Validate URL parameter
    if (!url) {
      return res.status(400).json({
        error: 'Missing required parameter: url'
      });
    }
    
    // Validate URL format
    if (!isValidUrl(url)) {
      return res.status(400).json({
        error: 'Invalid URL format'
      });
    }
    
    // Validate format parameter
    if (format !== 'markdown' && format !== 'json') {
      return res.status(400).json({
        error: 'Invalid format. Supported formats: markdown, json'
      });
    }
    
    // Extract content using web-content-extract with timeout
    const result = await extractContent(url, seo === 'true' || seo === true);
    
    // Format response based on requested format
    if (format === 'json') {
      res.json(result);
    } else {
      // Default to markdown format
      res.send(result.content);
    }
  } catch (error) {
    console.error('Error extracting content:', error);
    
    // Handle specific error cases
    if (error.message && error.message.includes('timeout')) {
      return res.status(408).json({
        error: 'Request timeout',
        message: 'The request to the URL timed out'
      });
    }
    
    if (error.message && error.message.includes('network')) {
      return res.status(502).json({
        error: 'Network error',
        message: 'Failed to fetch the URL'
      });
    }
    
    res.status(500).json({
      error: 'Failed to extract content',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Web Content Extract Server running on http://${HOST}:${PORT}`);
  console.log('Use /extract?url=<URL>&seo=true&format=markdown to extract content');
});

module.exports = app;