const mongooseReal = require('mongoose');
const mockMongoose = require('./mock-mongoose');

let activeMongoose = mongooseReal;

// Determine if we should use the mock database wrapper initially
const mongoUri = process.env.MONGO_URI || '';
const isMock = !mongoUri || 
               mongoUri.includes('<username>') || 
               mongoUri.includes('your_mongodb_uri') || 
               process.env.USE_MOCK_DB === 'true';

if (isMock) {
  console.log("Mock Mongoose: Active (using local file-based database).");
  activeMongoose = mockMongoose;
} else {
  console.log("Production Mongoose: Active (connecting to real MongoDB).");
}

function isFromApplication() {
  const stack = new Error().stack;
  if (!stack) return false;
  const lines = stack.split('\n');
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('mongoose-provider.js')) {
      continue;
    }
    if (line.includes('node_modules')) {
      return false;
    }
    return true;
  }
  return false;
}

class ProxySchema extends mongooseReal.Schema {
  constructor(definition, options) {
    super(definition, options);
    this.definition = definition;
    if (!this._hooks) {
      this._hooks = { pre: {}, post: {} };
    }
  }
  pre(...args) {
    super.pre(...args);
    if (!isFromApplication()) return;
    const fn = args.find(arg => typeof arg === 'function');
    if (fn) {
      const hookName = args[0];
      if (!this._hooks) {
        this._hooks = { pre: {}, post: {} };
      }
      if (!this._hooks.pre[hookName]) {
        this._hooks.pre[hookName] = [];
      }
      this._hooks.pre[hookName].push(fn);
    }
  }
  post(...args) {
    super.post(...args);
    if (!isFromApplication()) return;
    const fn = args.find(arg => typeof arg === 'function');
    if (fn) {
      const hookName = args[0];
      if (!this._hooks) {
        this._hooks = { pre: {}, post: {} };
      }
      if (!this._hooks.post[hookName]) {
        this._hooks.post[hookName] = [];
      }
      this._hooks.post[hookName].push(fn);
    }
  }
}

ProxySchema.Types = mongooseReal.Schema.Types;

const modelsMap = {};

const proxyMongoose = {
  Schema: ProxySchema,
  
  get connection() {
    if (activeMongoose === mockMongoose) {
      return { host: 'local-file-db' };
    }
    return mongooseReal.connection;
  },
  
  connect: async (uri, options) => {
    if (activeMongoose === mockMongoose) {
      return mockMongoose.connect(uri);
    }
    try {
      console.log("Connecting to MongoDB Atlas...");
      const conn = await mongooseReal.connect(uri, {
        serverSelectionTimeoutMS: 5000, // 5s timeout fallback
        ...options
      });
      return conn;
    } catch (err) {
      console.error(`MongoDB Atlas connection failed: ${err.message}`);
      console.log("Falling back to Mock Mongoose...");
      activeMongoose = mockMongoose;
      // Re-create models in the mock mongoose if they were already defined
      for (const [name, schema] of Object.entries(modelsMap)) {
        mockMongoose.model(name, schema);
      }
      return mockMongoose.connect(uri);
    }
  },
  
  model: (name, schema) => {
    modelsMap[name] = schema;
    
    // Register the model on both initially
    const realModel = mongooseReal.model(name, schema);
    const mockModel = mockMongoose.model(name, schema);
    
    // Create a proxy class/constructor
    class ProxyModel {
      constructor(data) {
        if (activeMongoose === mockMongoose) {
          return new mockModel(data);
        } else {
          return new realModel(data);
        }
      }
    }
    
    // Delegate static methods of the Model class
    const staticHandlers = {
      get(target, prop) {
        if (prop === 'prototype' || prop === 'name') {
          return target[prop];
        }
        const targetModel = activeMongoose === mockMongoose ? mockModel : realModel;
        const val = targetModel[prop];
        if (typeof val === 'function') {
          return val.bind(targetModel);
        }
        return val;
      },
      set(target, prop, value) {
        if (prop === 'prototype' || prop === 'name') {
          target[prop] = value;
          return true;
        }
        const targetModel = activeMongoose === mockMongoose ? mockModel : realModel;
        targetModel[prop] = value;
        return true;
      }
    };
    
    return new Proxy(ProxyModel, staticHandlers);
  }
};

module.exports = proxyMongoose;
