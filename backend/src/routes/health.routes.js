const router = require('express').Router();
const mongoose = require('mongoose');

router.get('/', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'up' : 'down' });
});

module.exports = router;
