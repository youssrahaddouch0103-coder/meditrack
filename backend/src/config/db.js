const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI manquant dans .env');
  await mongoose.connect(uri);
  console.log('MongoDB connecté');
}

module.exports = connectDB;
