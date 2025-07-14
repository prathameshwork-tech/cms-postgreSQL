// Standalone ESM script to add user@techcorp.com and admin@techcorp.com to PostgreSQL using Sequelize
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Database config (from .env or fallback)
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_NAME = process.env.DB_NAME || 'cms_db';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 5432;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false,
});

// Import User model factory and initialize
const UserModelFactory = (await import(path.resolve(__dirname, '../models/sequelize/User.js'))).default;
const User = UserModelFactory(sequelize);

async function addUser({ name, email, password, role, department }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists, skipping.`);
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    department,
    isActive: true
  });
  console.log(`Created user: ${email} (${role})`);
}

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL');
    await sequelize.sync(); // Ensure tables exist
    await addUser({
      name: 'Test User',
      email: 'user@techcorp.com',
      password: 'user123',
      role: 'user',
      department: 'IT'
    });
    await addUser({
      name: 'System Administrator',
      email: 'admin@techcorp.com',
      password: 'admin123',
      role: 'admin',
      department: 'IT'
    });
    await sequelize.close();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main(); 