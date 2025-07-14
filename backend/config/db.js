import { testConnection, loadModels, syncDatabase } from './database.js';

let models = null;

const connectDB = async () => {
  try {
    // Test PostgreSQL connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to PostgreSQL');
    }

    // Load Sequelize models
    const { models: loadedModels } = await loadModels();
    models = loadedModels;

    // Sync database (create tables if they don't exist)
    await syncDatabase(false); // false = don't force recreate tables

    console.log('✅ Database setup completed successfully');
    return models;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Export models for use in controllers
export const getModels = () => models;

export default connectDB; 