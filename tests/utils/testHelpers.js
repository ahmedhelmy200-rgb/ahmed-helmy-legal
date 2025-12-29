/**
 * Test Utilities and Helpers
 * Provides common test operations, mock data generators, and setup/teardown utilities
 */

// ==================== Mock Data Generators ====================

/**
 * Generate a mock user object
 * @param {Object} overrides - Properties to override defaults
 * @returns {Object} Mock user object
 */
function generateMockUser(overrides = {}) {
  return {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    ...overrides,
  };
}

/**
 * Generate a mock legal document object
 * @param {Object} overrides - Properties to override defaults
 * @returns {Object} Mock document object
 */
function generateMockDocument(overrides = {}) {
  return {
    id: 'doc_' + Math.random().toString(36).substr(2, 9),
    title: 'Sample Legal Document',
    content: 'This is the document content.',
    type: 'contract',
    status: 'draft',
    author: generateMockUser().id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['legal', 'contract'],
    metadata: {},
    ...overrides,
  };
}

/**
 * Generate a mock client object
 * @param {Object} overrides - Properties to override defaults
 * @returns {Object} Mock client object
 */
function generateMockClient(overrides = {}) {
  return {
    id: 'client_' + Math.random().toString(36).substr(2, 9),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    address: '123 Main St, City, State 12345',
    company: 'Example Company',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    ...overrides,
  };
}

/**
 * Generate a mock case object
 * @param {Object} overrides - Properties to override defaults
 * @returns {Object} Mock case object
 */
function generateMockCase(overrides = {}) {
  return {
    id: 'case_' + Math.random().toString(36).substr(2, 9),
    caseNumber: 'CASE-' + Math.floor(Math.random() * 100000),
    title: 'Sample Legal Case',
    description: 'This is a sample case description.',
    status: 'open',
    clientId: generateMockClient().id,
    assignedLawyer: generateMockUser().id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    documents: [],
    notes: [],
    ...overrides,
  };
}

/**
 * Generate multiple mock objects
 * @param {Function} generator - Generator function
 * @param {number} count - Number of objects to generate
 * @param {Object} overrides - Properties to override defaults
 * @returns {Array} Array of mock objects
 */
function generateMockArray(generator, count = 5, overrides = {}) {
  return Array.from({ length: count }, (_, index) =>
    generator({
      ...overrides,
      id: overrides.id ? `${overrides.id}_${index}` : undefined,
    })
  ).map(obj => {
    if (obj.id && obj.id.includes('undefined')) {
      delete obj.id;
    }
    return obj;
  });
}

// ==================== Assertion Helpers ====================

/**
 * Assert that an object has all expected properties
 * @param {Object} obj - Object to check
 * @param {Array<string>} properties - Expected properties
 * @returns {boolean} True if all properties exist
 */
function assertHasProperties(obj, properties) {
  return properties.every(prop => prop in obj);
}

/**
 * Assert that an object does not have certain properties
 * @param {Object} obj - Object to check
 * @param {Array<string>} properties - Properties that should not exist
 * @returns {boolean} True if none of the properties exist
 */
function assertDoesNotHaveProperties(obj, properties) {
  return properties.every(prop => !(prop in obj));
}

/**
 * Assert that a value matches a schema pattern
 * @param {*} value - Value to validate
 * @param {Object} schema - Schema pattern to match
 * @returns {boolean} True if value matches schema
 */
function assertMatchesSchema(value, schema) {
  if (typeof schema === 'string') {
    return typeof value === schema;
  }
  if (schema instanceof RegExp) {
    return schema.test(String(value));
  }
  if (Array.isArray(schema)) {
    return Array.isArray(value) && value.every(v => assertMatchesSchema(v, schema[0]));
  }
  if (typeof schema === 'object' && schema !== null) {
    return (
      typeof value === 'object' &&
      value !== null &&
      Object.keys(schema).every(key => assertMatchesSchema(value[key], schema[key]))
    );
  }
  return value === schema;
}

// ==================== Timing and Delay Utilities ====================

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function delay(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for a condition to be true with a timeout
 * @param {Function} condition - Function that returns boolean
 * @param {number} timeout - Maximum time to wait in ms
 * @param {number} interval - Check interval in ms
 * @returns {Promise<boolean>} True if condition met within timeout
 */
async function waitUntil(condition, timeout = 5000, interval = 100) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return true;
    }
    await delay(interval);
  }
  return false;
}

// ==================== Mock Data Cleaners ====================

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Remove sensitive fields from an object
 * @param {Object} obj - Object to sanitize
 * @param {Array<string>} sensitiveFields - Fields to remove
 * @returns {Object} Sanitized object
 */
function sanitizeObject(obj, sensitiveFields = ['password', 'token', 'secret', 'apiKey']) {
  const cloned = deepClone(obj);
  sensitiveFields.forEach(field => {
    if (field in cloned) {
      delete cloned[field];
    }
  });
  return cloned;
}

// ==================== Setup and Teardown Utilities ====================

/**
 * Create a test context with common utilities
 * @param {Object} options - Configuration options
 * @returns {Object} Test context object
 */
function createTestContext(options = {}) {
  return {
    mocks: {
      users: [],
      documents: [],
      clients: [],
      cases: [],
    },
    fixtures: {},
    cleanup: async function () {
      // Reset all mock data
      this.mocks.users = [];
      this.mocks.documents = [];
      this.mocks.clients = [];
      this.mocks.cases = [];
      this.fixtures = {};
    },
    addMockUser: function (overrides) {
      const user = generateMockUser(overrides);
      this.mocks.users.push(user);
      return user;
    },
    addMockDocument: function (overrides) {
      const doc = generateMockDocument(overrides);
      this.mocks.documents.push(doc);
      return doc;
    },
    addMockClient: function (overrides) {
      const client = generateMockClient(overrides);
      this.mocks.clients.push(client);
      return client;
    },
    addMockCase: function (overrides) {
      const caseObj = generateMockCase(overrides);
      this.mocks.cases.push(caseObj);
      return caseObj;
    },
    ...options,
  };
}

/**
 * Setup common test environment
 * @returns {Object} Environment object with cleanup function
 */
function setupTestEnvironment() {
  const env = {
    originalEnv: { ...process.env },
    setEnv: function (key, value) {
      process.env[key] = value;
    },
    getEnv: function (key) {
      return process.env[key];
    },
    cleanup: function () {
      // Restore original environment
      Object.keys(process.env).forEach(key => {
        if (!(key in this.originalEnv)) {
          delete process.env[key];
        }
      });
      Object.assign(process.env, this.originalEnv);
    },
  };

  return env;
}

/**
 * Create a spy object for tracking function calls
 * @param {Function} fn - Function to spy on
 * @returns {Object} Spy object with call tracking
 */
function createSpyFunction(fn = () => {}) {
  const spy = {
    callCount: 0,
    calls: [],
    returnValues: [],
    lastCallArgs: null,
    lastReturnValue: null,
    implementation: fn,
    reset: function () {
      this.callCount = 0;
      this.calls = [];
      this.returnValues = [];
      this.lastCallArgs = null;
      this.lastReturnValue = null;
    },
    mockImplementation: function (newFn) {
      this.implementation = newFn;
    },
  };

  // Return a function that tracks calls
  return function (...args) {
    spy.callCount++;
    spy.calls.push(args);
    spy.lastCallArgs = args;
    const result = spy.implementation(...args);
    spy.returnValues.push(result);
    spy.lastReturnValue = result;
    return result;
  };
}

// ==================== Error and Validation Helpers ====================

/**
 * Expect a function to throw an error
 * @param {Function} fn - Function to execute
 * @param {string|RegExp} expectedError - Expected error message or pattern
 * @returns {Object} Error that was thrown
 */
function expectToThrow(fn, expectedError = null) {
  try {
    fn();
    throw new Error('Expected function to throw an error');
  } catch (error) {
    if (expectedError) {
      if (typeof expectedError === 'string') {
        if (!error.message.includes(expectedError)) {
          throw new Error(`Expected error message to include "${expectedError}", but got "${error.message}"`);
        }
      } else if (expectedError instanceof RegExp) {
        if (!expectedError.test(error.message)) {
          throw new Error(`Expected error message to match ${expectedError}, but got "${error.message}"`);
        }
      }
    }
    return error;
  }
}

/**
 * Validate an email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
function isValidPhone(phone) {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// ==================== Exports ====================

module.exports = {
  // Mock data generators
  generateMockUser,
  generateMockDocument,
  generateMockClient,
  generateMockCase,
  generateMockArray,

  // Assertion helpers
  assertHasProperties,
  assertDoesNotHaveProperties,
  assertMatchesSchema,

  // Timing utilities
  delay,
  waitUntil,

  // Data utilities
  deepClone,
  sanitizeObject,

  // Setup/teardown
  createTestContext,
  setupTestEnvironment,
  createSpyFunction,

  // Error/validation
  expectToThrow,
  isValidEmail,
  isValidPhone,
};
