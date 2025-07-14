// directSetUserPassword.js
import dotenv from 'dotenv';
dotenv.config();
import { loadModels, testConnection } from '../config/database.js';

async function main() {
  const userId = process.argv[2];
  const newPassword = process.argv[3];
  if (!userId || !newPassword) {
    console.error('Usage: node scripts/directSetUserPassword.js <userId> <newPassword>');
    process.exit(1);
  }
  await testConnection();
  const { models } = await loadModels();
  const { User } = models;
  const user = await User.findByPk(userId);
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }
  console.log('User before password change:', user.toJSON());
  user.set('password', newPassword);
  user.changed('password', true);
  await user.save();
  console.log('User after password change:', user.toJSON());
  console.log('Password after save (should be hashed):', user.password);
  process.exit(0);
}

main(); 