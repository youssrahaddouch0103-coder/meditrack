const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:4200' }));
app.use(express.json());

app.use('/api/health', require('./routes/health.routes'));

app.use((req, res) => res.status(404).json({ message: 'Route introuvable' }));

module.exports = app;
