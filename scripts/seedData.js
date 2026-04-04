require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../src/models/User');
const FinancialRecord = require('../src/models/FinancialRecord');
const { ROLES, USER_STATUS } = require('../src/constants/roles');
const { getEnv } = require('../src/config/env');

async function main() {
  const { mongodbUri: uri } = getEnv();
  if (!uri) {
    console.error('Set MONGO_URI (or MONGODB_URI) in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  let user = await User.findOne({ email });
  
  if (!user) {
    console.log(`User ${email} not found, creating one...`);
    const hashedPassword = await User.hashPassword(process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!');
    user = await User.create({
      email,
      password: hashedPassword,
      name: 'System Admin',
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
    });
  }

  console.log(`Using user ${user.email} (ID: ${user._id}) for assigning records.`);

  // Clear existing records to ensure we don't duplicate on multiple runs
  await FinancialRecord.deleteMany({});
  console.log('Cleared existing records.');

  // Create sample records
  const sampleRecords = [
    { amount: 5000, type: 'income', category: 'Salary', date: new Date('2024-03-01'), note: 'March Salary', userId: user._id },
    { amount: 1500, type: 'income', category: 'Freelance', date: new Date('2024-03-05'), note: 'Web Dev Project', userId: user._id },
    { amount: 200,  type: 'income', category: 'Investments', date: new Date('2024-03-10'), note: 'Dividend', userId: user._id },
    { amount: 1200, type: 'expense', category: 'Rent', date: new Date('2024-03-02'), note: 'Apartment Rent', userId: user._id },
    { amount: 400,  type: 'expense', category: 'Groceries', date: new Date('2024-03-08'), note: 'Weekly Groceries', userId: user._id },
    { amount: 150,  type: 'expense', category: 'Utilities', date: new Date('2024-03-12'), note: 'Electricity and Internet', userId: user._id },
    { amount: 100,  type: 'expense', category: 'Entertainment', date: new Date('2024-03-15'), note: 'Movies and Dining', userId: user._id },
    { amount: 60,   type: 'expense', category: 'Transportation', date: new Date('2024-03-18'), note: 'Gas', userId: user._id },
    
    // Previous month data for better dashboard visualization
    { amount: 5000, type: 'income', category: 'Salary', date: new Date('2024-02-01'), note: 'February Salary', userId: user._id },
    { amount: 1200, type: 'expense', category: 'Rent', date: new Date('2024-02-02'), note: 'Apartment Rent', userId: user._id },
    { amount: 350,  type: 'expense', category: 'Groceries', date: new Date('2024-02-10'), note: 'Weekly Groceries', userId: user._id },
  ];

  await FinancialRecord.insertMany(sampleRecords);
  console.log(`Inserted ${sampleRecords.length} financial records successfully!`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
