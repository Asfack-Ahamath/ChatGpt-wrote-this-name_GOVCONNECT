const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { seedDatabase } = require('../data/seedData');

// Load environment variables
dotenv.config();

const connectAndSeed = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    
    // Run the seeding process
    await seedDatabase();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Collections created:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
connectAndSeed();