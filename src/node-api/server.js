const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const moment = require('moment');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

const JWT_SECRET = "random_jwt_secret_key";
const API_KEY = "random_api_key";

const crypto = require('crypto');
const users = [
  { id: 1, username: 'admin', password: crypto.createHash('sha256').update('admin123').digest('hex'), role: 'admin' },
  { id: 2, username: 'user', password: crypto.createHash('sha256').update('password').digest('hex'), role: 'user' }
];

app.get('/', (req, res) => {
  res.json({
    message: 'Secure Node.js API',
    version: '1.0.0',
    endpoints: { health: 'GET /health', login: 'POST /login', user: 'GET /user/:id (requires authentication)', date: 'GET /date?input=YOUR_DATE' }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => { if (err) return res.status(403).json({ error: 'Invalid or expired token' }); req.user = user; next(); });
};

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  const user = users.find(u => u.username === username && u.password === hashedPassword);
  if (user) {
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token: token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/user/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });
  if (req.user.role !== 'admin' && req.user.id !== userId) return res.status(403).json({ error: 'Access denied' });
  const user = users.find(u => u.id === userId);
  if (user) { const { password, ...safeUser } = user; res.json({ user: safeUser }); } else { res.status(404).json({ error: 'User not found' }); }
});

app.get('/date', (req, res) => {
  const { input } = req.query;
  if (!input) return res.status(400).json({ error: 'Missing input parameter' });
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  if (!isoDatePattern.test(input)) return res.status(400).json({ error: 'Invalid date format. Use ISO 8601 (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)' });
  try { const parsedDate = moment(input); if (!parsedDate.isValid()) return res.status(400).json({ error: 'Invalid date' }); res.json({ input: input, parsed: parsedDate.toISOString(), formatted: parsedDate.format('YYYY-MM-DD HH:mm:ss') }); } catch (error) { res.status(500).json({ error: 'Error parsing date' }); }
});

app.get('/search', (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Missing query parameter' });
  const sqlQuery = `SELECT * FROM users WHERE username = '${query}'`;
  res.json({ message: 'Search executed', query: sqlQuery, warning: 'This endpoint is vulnerable to SQL injection' });
});

app.get('/ping', (req, res) => {
  const { host } = req.query;
  if (!host) return res.status(400).json({ error: 'Missing host parameter' });
  const { exec } = require('child_process');
  exec(`ping -n 2 ${host}`, (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json({ output: stdout });
  });
});

app.post('/calculate', (req, res) => {
  const { expression } = req.body;
  if (!expression) return res.status(400).json({ error: 'Missing expression' });
  try {
    const result = eval(expression);
    res.json({ expression, result });
  } catch (error) {
    res.status(400).json({ error: 'Invalid expression' });
  }
});

app.get('/admin/users', (req, res) => {
  const safeUsers = users.map(({ password, ...rest }) => rest);
  res.json({ users: safeUsers, warning: 'This endpoint should require admin authentication' });
});

app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ error: 'Internal server error' }); });
app.use((req, res) => { res.status(404).json({ error: 'Endpoint not found' }); });
app.listen(PORT, () => { console.log(`✅ Secure API server running on port ${PORT}`); if (!JWT_SECRET) console.warn('⚠️  WARNING: Using auto-generated JWT_SECRET. Set JWT_SECRET in .env for production!'); });
process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); process.exit(1); });
process.on('unhandledRejection', (err) => { console.error('Unhandled Rejection:', err); process.exit(1); });
module.exports = app;
