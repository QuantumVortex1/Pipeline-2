const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const moment = require('moment');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware with security limits
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

// SECURE: Use environment variables for secrets
const JWT_SECRET = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');
const API_KEY = process.env.API_KEY || require('crypto').randomBytes(32).toString('hex');

// In-Memory "Database" with hashed passwords
const crypto = require('crypto');
const users = [
  { 
    id: 1, 
    username: 'admin', 
    password: crypto.createHash('sha256').update('admin123').digest('hex'),
    role: 'admin' 
  },
  { 
    id: 2, 
    username: 'user', 
    password: crypto.createHash('sha256').update('password').digest('hex'),
    role: 'user' 
  }
];

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Secure Node.js API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      login: 'POST /login',
      user: 'GET /user/:id (requires authentication)',
      date: 'GET /date?input=YOUR_DATE'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// SECURE: Proper authentication with hashed passwords
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Input validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Hash the incoming password
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  
  // Secure user lookup with hashed password comparison
  const user = users.find(u => u.username === username && u.password === hashedPassword);
  
  if (user) {
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ 
      success: true, 
      token: token
      // SECURE: Don't expose sensitive data
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// SECURE: User endpoint with proper validation and authorization
app.get('/user/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  
  // Input validation
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  // Authorization check
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const user = users.find(u => u.id === userId);
  
  if (user) {
    // Don't expose sensitive data
    const { password, ...safeUser } = user;
    res.json({ user: safeUser });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// SECURE: Date parsing with input validation
app.get('/date', (req, res) => {
  const { input } = req.query;
  
  if (!input) {
    return res.status(400).json({ error: 'Missing input parameter' });
  }
  
  // Input validation: only accept ISO 8601 format
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  if (!isoDatePattern.test(input)) {
    return res.status(400).json({ 
      error: 'Invalid date format. Use ISO 8601 (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)' 
    });
  }
  
  try {
    const parsedDate = moment(input);
    if (!parsedDate.isValid()) {
      return res.status(400).json({ error: 'Invalid date' });
    }
    res.json({ 
      input: input,
      parsed: parsedDate.toISOString(),
      formatted: parsedDate.format('YYYY-MM-DD HH:mm:ss')
    });
  } catch (error) {
    res.status(500).json({ error: 'Error parsing date' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Secure API server running on port ${PORT}`);
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: Using auto-generated JWT_SECRET. Set JWT_SECRET in .env for production!');
  }
});

// Graceful error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = app;
