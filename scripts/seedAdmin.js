require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../src/models/User');
const { ROLES, USER_STATUS } = require('../src/constants/roles');
const { getEnv } = require('../src/config/env');

async function main() {
  const { mongodbUri: uri } = getEnv();
  if (!uri) {
    console.error('Set MONGO_URI (or MONGODB_URI) in .env');
    process.exit(1);
  }
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

  await mongoose.connect(uri);
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('User with this email already exists:', email);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await User.hashPassword(password);
  await User.create({
    email,
    password: hashedPassword,
    name: 'System Admin',
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
  });

  console.log('Admin user created:', email);
  console.log('Change SEED_ADMIN_PASSWORD in production and remove defaults from logs.');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
