const mongoose = require('../mongoose-provider');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('No MongoDB connection string found in MONGO_URI or MONGODB_URI');
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    // Do not exit the process to allow the server to keep running/falling back
  }
};

module.exports = connectDB;
