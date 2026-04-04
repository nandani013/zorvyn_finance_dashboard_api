const mongoose = require('mongoose');
const { getEnv } = require('./env');

mongoose.set('strictQuery', true);

/**
 * Connects to MongoDB using `MONGO_URI` or `MONGODB_URI` from the environment.
 * Call after `dotenv.config()` in `server.js`.
 */
async function connectDb() {
  const { mongodbUri } = getEnv();
  if (!mongodbUri || typeof mongodbUri !== 'string' || !mongodbUri.trim()) {
    throw new Error('MONGO_URI (or MONGODB_URI) is missing or empty. Set it in your .env file.');
  }

  await mongoose.connect(mongodbUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  });
}

async function disconnectDb() {
  await mongoose.disconnect();
}

function isConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDb, disconnectDb, isConnected };
