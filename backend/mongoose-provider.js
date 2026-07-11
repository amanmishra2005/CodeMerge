const mongooseReal = require('mongoose');

// Determine if we should use the mock database wrapper
const mongoUri = process.env.MONGO_URI || '';
const isMock = !mongoUri || 
               mongoUri.includes('<username>') || 
               mongoUri.includes('your_mongodb_uri') || 
               process.env.USE_MOCK_DB === 'true';

if (isMock) {
  console.log("Mock Mongoose: Active (using local file-based database).");
  module.exports = require('./mock-mongoose');
} else {
  console.log("Production Mongoose: Active (connecting to real MongoDB).");
  module.exports = mongooseReal;
}
