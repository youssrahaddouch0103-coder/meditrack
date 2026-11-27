require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

connectDB(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`API MediTrack sur http://localhost:${PORT}`)))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
