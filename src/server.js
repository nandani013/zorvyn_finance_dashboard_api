const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envResult = require('dotenv').config({ path: envPath });

if (envResult.error?.code === 'ENOENT') {
  console.warn(
    `[env] No .env file found at ${envPath}. Copy .env.example to .env and set MONGO_URI and JWT_SECRET.`
  );
} else if (envResult.error) {
  console.warn(`[env] ${envResult.error.message}`);
}

const app = require('./app');
const { connectDb, getEnv } = require('./config');

const { port, mongodbUri } = getEnv();
const mongo = String(mongodbUri || '').trim();

if (!mongo) {
  console.error(
    '\nCannot start: MONGO_URI (or MONGODB_URI) is empty.\n' +
      `  Edit .env in: ${path.join(__dirname, '..')}\n` +
      '  Set MONGO_URI to your MongoDB Atlas string (Database → Connect → Drivers).\n' +
      '  Example shape: mongodb+srv://<user>:<password>@<cluster>/<dbname>?retryWrites=true&w=majority\n'
  );
  process.exit(1);
}

if (!mongo.startsWith('mongodb://') && !mongo.startsWith('mongodb+srv://')) {
  console.error(
    '\nCannot start: MONGO_URI must be a real MongoDB connection string.\n' +
      '  It should start with mongodb:// or mongodb+srv:// (not placeholder text).\n'
  );
  process.exit(1);
}

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message || err);
    console.error('Check MONGO_URI, Atlas IP allowlist (0.0.0.0/0 for dev), and database user password.');
    process.exit(1);
  });
