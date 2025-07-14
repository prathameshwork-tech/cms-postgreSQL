// Standalone ESM script to directly set the admin password hash for admin@techcorp.com and print debug info
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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

const UserModelFactory = (await import(path.resolve(__dirname, '../models/sequelize/User.js'))).default;
const User = UserModelFactory(sequelize);

async function directSetAdminPassword() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const admin = await User.findOne({ where: { email: 'admin@techcorp.com' } });
    if (!admin) {
      console.log('Admin user not found.');
      process.exit(1);
    }
    // Generate bcrypt hash for 'admin123'
    const hash = await bcrypt.hash('admin123', 10);
    console.log('Generated hash for admin123:', hash);
    // Directly set the password field (bypass model hook)
    await User.update({ password: hash }, { where: { email: 'admin@techcorp.com' } });
    // Fetch updated admin
    const updatedAdmin = await User.findOne({ where: { email: 'admin@techcorp.com' } });
    console.log('Hash in database after update:', updatedAdmin.password);
    // Test bcrypt compare in this script
    const match = await bcrypt.compare('admin123', updatedAdmin.password);
    console.log('bcrypt.compare("admin123", updated hash) result:', match);
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Error directly setting admin password:', err);
    process.exit(1);
  }
}

directSetAdminPassword(); 