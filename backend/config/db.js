const mongoose = require('../mongoose-provider');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    // Do not exit the process to allow the server to keep running/falling back
  }
};

module.exports = connectDB;
