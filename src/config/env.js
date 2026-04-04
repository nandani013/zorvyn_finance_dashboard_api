/**
 * Central place for environment-derived settings.
 * Load `dotenv` in `server.js` before requiring this module.
 */
function getEnv() {
  const mongodbUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 5000,
    mongodbUri,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };
}

module.exports = { getEnv };
