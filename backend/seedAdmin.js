const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./model/user.model.js');

const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@rentup.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI missing from .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (existing) {
    if (existing.isAdmin) {
      console.log(`Admin already exists: ${existing.email}`);
    } else {
      existing.isAdmin = true;
      existing.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await existing.save();
      console.log(`Promoted existing user to admin: ${existing.email}`);
    }
  } else {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashed,
      isAdmin: true,
    });
    console.log(`Admin created: ${admin.email}`);
  }

  console.log('\nLogin credentials:');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
