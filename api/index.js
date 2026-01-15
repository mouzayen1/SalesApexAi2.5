// Vercel Serverless Function Handler
const express = require('express');
const path = require('path');

// Import the built Express app
const app = require('../server/dist/index.js').default;

// Export the Express app as a serverless function
module.exports = app;
