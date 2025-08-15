const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/govconnect', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Find the admin user
    const admin = await User.findOne({ email: 'test@example.com' });
    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }

    // Reset password to 'asdf1234'
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash('asdf1234', salt);
    await admin.save();

    console.log('✅ Admin password reset successfully!');
    console.log('New password: asdf1234');
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    mongoose.disconnect();
  }
}

resetAdminPassword();
