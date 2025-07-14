// Standalone ESM script to reset the admin password to 'admin123' for admin@techcorp.com
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
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

async function resetAdminPassword() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const admin = await User.findOne({ where: { email: 'admin@techcorp.com' } });
    if (!admin) {
      console.log('Admin user not found.');
      process.exit(1);
    }
    admin.set('password', 'admin123'); // Explicitly mark as changed
    await admin.save();
    console.log('✅ Admin password reset to admin123 for admin@techcorp.com (hashed by model hook, using .set)');
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Error resetting admin password:', err);
    process.exit(1);
  }
}

resetAdminPassword(); 