// Run with: node scripts/fixAdminRole.js
import { getModels } from '../config/db.js';
import connectDB from '../config/db.js';

async function fixAdminRole() {
  await connectDB();
  const { User } = getModels();
  const emails = ['admin@techcorp.com', 'padmin@techcorp.com'];
  for (const email of emails) {
    const user = await User.findOne({ where: { email } });
    if (user) {
      await user.update({ role: 'admin', isActive: true });
      console.log(`Updated ${email}: role=admin, isActive=true`);
    } else {
      console.log(`User not found: ${email}`);
    }
  }
  process.exit(0);
}

fixAdminRole().catch(err => {
  console.error('Error updating admin roles:', err);
  process.exit(1);
}); 