const fs = require('fs');
const path = require('path');

// Simple file-based database helper
const DB_FILE = path.join(__dirname, 'mock-db.json');

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], contacts: [] }, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { users: [], contacts: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

class Schema {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
    this.methods = {};
    this.statics = {};
    this._hooks = { pre: {}, post: {} };
  }

  pre(hookName, fn) {
    if (!this._hooks.pre[hookName]) {
      this._hooks.pre[hookName] = [];
    }
    this._hooks.pre[hookName].push(fn);
  }

  post(hookName, fn) {
    if (!this._hooks.post[hookName]) {
      this._hooks.post[hookName] = [];
    }
    this._hooks.post[hookName].push(fn);
  }
}

Schema.Types = {
  Mixed: 'Mixed',
  ObjectId: 'ObjectId'
};

function getPropDefaults(prop) {
  if (!prop) return undefined;
  if (prop.default !== undefined) {
    return typeof prop.default === 'function' ? prop.default() : JSON.parse(JSON.stringify(prop.default));
  }
  return undefined;
}

function applyDefaults(data, definition) {
  const result = data ? { ...data } : {};
  for (const key in definition) {
    const prop = definition[key];
    if (result[key] === undefined) {
      const defaultVal = getPropDefaults(prop);
      if (defaultVal !== undefined) {
        result[key] = defaultVal;
      } else if (Array.isArray(prop)) {
        result[key] = [];
      } else if (typeof prop === 'object' && prop !== null && !prop.type) {
        result[key] = applyDefaults({}, prop);
      }
    }
    
    // If it is an object (or has schema type), apply the sub-defaults
    if (result[key] !== undefined) {
      if (prop && prop.type && prop.type.definition) {
        result[key] = applyDefaults(result[key], prop.type.definition);
      } else if (prop && prop.definition) {
        result[key] = applyDefaults(result[key], prop.definition);
      } else if (typeof prop === 'object' && prop !== null && !prop.type && !Array.isArray(prop)) {
        result[key] = applyDefaults(result[key], prop);
      }
    }
  }
  return result;
}

const mongoose = {
  Schema,
  connect: async (uri) => {
    console.log("Mock Mongoose: Connected to local file-based database.");
    return { connection: { host: 'local-file-db' } };
  },
  model: (modelName, schema) => {
    const collectionName = modelName.toLowerCase() + 's';

    class Model {
      constructor(data) {
        const withDefaults = applyDefaults(data, schema.definition);
        Object.assign(this, withDefaults);
        this._original = JSON.parse(JSON.stringify(withDefaults || {}));
        
        // Copy instance methods
        for (const methodName in schema.methods) {
          this[methodName] = schema.methods[methodName].bind(this);
        }
      }

      toObject() {
        const obj = { ...this };
        // Remove methods and internal tracking properties
        for (const methodName in schema.methods) {
          delete obj[methodName];
        }
        delete obj._original;
        return obj;
      }

      isModified(path) {
        if (!this._id) return true; // new document
        if (this._original[path] === undefined) {
          return this[path] !== undefined;
        }
        return JSON.stringify(this[path]) !== JSON.stringify(this._original[path]);
      }

      async save() {
        const db = readDb();
        const collection = db[collectionName] || [];

        // Run pre-save hooks
        const preHooks = schema._hooks.pre['save'] || [];
        for (const hook of preHooks) {
          await new Promise((resolve, reject) => {
            hook.call(this, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }

        if (!this._id) {
          this._id = Math.random().toString(36).substring(2, 15);
          this.createdAt = new Date();
        }
        this.updatedAt = new Date();

        const cleanData = this.toObject();
        const idx = collection.findIndex(item => item._id === this._id);
        if (idx !== -1) {
          collection[idx] = cleanData;
        } else {
          collection.push(cleanData);
        }

        db[collectionName] = collection;
        writeDb(db);
        
        // Update _original after save
        this._original = JSON.parse(JSON.stringify(cleanData));
        return this;
      }
    }

    // Copy statics
    for (const staticName in schema.statics) {
      Model[staticName] = schema.statics[staticName];
    }

    Model.findOne = async (query) => {
      const db = readDb();
      const collection = db[collectionName] || [];
      const found = collection.find(item => {
        for (const key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
      return found ? new Model(found) : null;
    };

    Model.findById = async (id) => {
      const db = readDb();
      const collection = db[collectionName] || [];
      const found = collection.find(item => item._id === id);
      return found ? new Model(found) : null;
    };

    Model.create = async (data) => {
      const instance = new Model(data);
      await instance.save();
      return instance;
    };

    return Model;
  }
};

module.exports = mongoose;
