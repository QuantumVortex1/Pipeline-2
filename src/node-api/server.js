const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const moment = require('moment');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// VULNERABILITY 1: Hardcoded JWT Secret (should be in environment variable)
const JWT_SECRET = "super-secret-key-12345";

// VULNERABILITY 2: Hardcoded API Key
const API_KEY = "sk-1234567890abcdef";

// In-Memory "Database" (for demo purposes)
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'user', password: 'password', role: 'user' }
];

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Vulnerable Node.js API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      login: 'POST /login',
      eval: 'GET /eval?code=YOUR_CODE',
      user: 'GET /user/:id',
      merge: 'POST /merge',
      proxy: 'GET /proxy?url=YOUR_URL',
      date: 'GET /date?input=YOUR_DATE'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// VULNERABILITY 3: Weak authentication with hardcoded credentials
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // VULNERABILITY 4: SQL Injection simulation (string concatenation)
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.json({ 
      success: true, 
      token: token,
      // VULNERABILITY 5: Exposing sensitive data in response
      apiKey: API_KEY
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// VULNERABILITY 6: Code Injection via eval()
app.get('/eval', (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter' });
  }
  
  try {
    // CRITICAL: eval() allows arbitrary code execution!
    const result = eval(code);
    res.json({ result: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VULNERABILITY 7: No input validation (potential injection)
app.get('/user/:id', (req, res) => {
  const { id } = req.params;
  
  // Simulating SQL query string concatenation (SQL Injection risk)
  const query = `SELECT * FROM users WHERE id = ${id}`;
  
  const user = users.find(u => u.id == id);
  
  if (user) {
    res.json({ 
      query: query,  // VULNERABILITY 8: Exposing query structure
      user: user 
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// VULNERABILITY 9: Prototype Pollution using vulnerable lodash version
app.post('/merge', (req, res) => {
  const { source } = req.body;
  
  // Using vulnerable lodash merge (Prototype Pollution CVE-2019-10744)
  const target = {};
  const merged = _.merge(target, source);
  
  res.json({ 
    message: 'Objects merged',
    result: merged 
  });
});

// VULNERABILITY 10: Server-Side Request Forgery (SSRF)
app.get('/proxy', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }
  
  try {
    // No URL validation - can access internal services!
    const response = await axios.get(url);
    res.json({ 
      data: response.data,
      status: response.status 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VULNERABILITY 11: ReDoS (Regular Expression Denial of Service) using vulnerable moment.js
app.get('/date', (req, res) => {
  const { input } = req.query;
  
  if (!input) {
    return res.status(400).json({ error: 'Missing input parameter' });
  }
  
  // Vulnerable moment.js version can cause ReDoS
  const parsed = moment(input);
  
  res.json({
    input: input,
    parsed: parsed.format('YYYY-MM-DD HH:mm:ss'),
    isValid: parsed.isValid()
  });
});

// VULNERABILITY 12: No rate limiting, no security headers, no CORS configuration

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Vulnerable API running on http://localhost:${PORT}`);
  console.log(`⚠️  WARNING: This API contains intentional security vulnerabilities!`);
  console.log(`📝 Use only for DevSecOps testing purposes`);
});

// VULNERABILITY 13: Uncaught exception handling (can crash the server)
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Should exit gracefully in production
});
