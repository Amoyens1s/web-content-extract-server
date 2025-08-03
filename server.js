const express = require('express');
const { extractContent } = require('web-content-extract');

const app = express();
const PORT = 8030;
const HOST = '0.0.0.0';

// Middleware to parse query parameters
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Normalize URL by adding http:// prefix if missing
function normalizeUrl(url) {
  if (!url) return url;
  
  // Check if URL already has a protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Add http:// prefix for URLs without protocol
  return 'http://' + url;
}

// Validate URL format
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Convert SEO metadata to YAML Front Matter
function seoToYamlFrontMatter(seo) {
  if (!seo) return '';
  
  const yamlLines = ['---'];
  for (const [key, value] of Object.entries(seo)) {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object') {
        yamlLines.push(`${key}:`);
        for (const [subKey, subValue] of Object.entries(value)) {
          if (subValue !== undefined && subValue !== null && subValue !== '') {
            yamlLines.push(`  ${subKey}: ${JSON.stringify(subValue)}`);
          }
        }
      } else {
        yamlLines.push(`${key}: ${JSON.stringify(value)}`);
      }
    }
  }
  yamlLines.push('---', '');
  return yamlLines.join('\n');
}

// Main route for content extraction
app.get('/extract', async (req, res) => {
  try {
    const { url, seo = true, format = 'markdown' } = req.query;
    
    // Convert string parameters to appropriate types
    const includeSeo = seo === 'true' || seo === true;
    const outputFormat = format;
    
    // Validate URL parameter
    if (!url) {
      return res.status(400).json({
        error: 'Missing required parameter: url'
      });
    }
    
    // Normalize URL (add http:// prefix if missing)
    const normalizedUrl = normalizeUrl(url);
    
    // Validate URL format
    if (!isValidUrl(normalizedUrl)) {
      return res.status(400).json({
        error: 'Invalid URL format'
      });
    }
    
    // Validate format parameter
    if (outputFormat !== 'markdown' && outputFormat !== 'json') {
      return res.status(400).json({
        error: 'Invalid format. Supported formats: markdown, json'
      });
    }
    
    // Extract content using web-content-extract with timeout
    const result = await extractContent(normalizedUrl, includeSeo);
    
    // Format response based on requested format
    if (outputFormat === 'json') {
      res.json(result);
    } else {
      // Default to markdown format
      if (includeSeo && result.seo) {
        // Include SEO metadata as YAML Front Matter
        const frontMatter = seoToYamlFrontMatter(result.seo);
        res.send(frontMatter + (result.content || ''));
      } else {
        // Return content only
        res.send(result.content || '');
      }
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