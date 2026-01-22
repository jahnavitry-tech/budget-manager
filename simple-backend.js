// Simple backend starter
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Backend Server Running on Port 5001' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', port: 5001 });
});

app.listen(5001, () => {
  console.log('Backend server running on http://localhost:5001');
});