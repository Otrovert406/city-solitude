// Netlify Functions wrapper — adapts the Vercel Express handler for Netlify
const serverless = require('serverless-http');
const app = require('../../api/index.cjs');

// Export handler for Netlify Functions
exports.handler = serverless(app);
