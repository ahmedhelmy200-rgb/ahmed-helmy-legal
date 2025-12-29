/**
 * Main Express Server Setup
 * إعداد خادم Express الرئيسي
 * 
 * This file initializes the Express server with all necessary middleware,
 * routes, and error handling configurations.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Import database connection
const { initializeDatabase } = require('./database');

// Import routes
const legislationRoutes = require('./routes/legislation');
const knowledgeBankRoutes = require('./routes/knowledge-bank');
const newsRoutes = require('./routes/news');
const libraryRoutes = require('./routes/library');
const branchesRoutes = require('./routes/branches');
const usersRoutes = require('./routes/users');

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Security middleware
app.use(helmet()); // Set various HTTP headers for security

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging middleware
app.use(morgan(process.env.LOG_FORMAT || 'combined'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// API ROUTES
// ============================================

// Base API route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Ahmed Helmy Legal Services API',
    version: '1.0.0',
    endpoints: {
      legislation: '/api/legislation',
      knowledge_bank: '/api/knowledge-bank',
      news: '/api/news',
      library: '/api/library',
      branches: '/api/branches',
      users: '/api/users'
    }
  });
});

// Routes registration
// مسجلات المسارات
app.use('/api/legislation', legislationRoutes);
app.use('/api/knowledge-bank', knowledgeBankRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/users', usersRoutes);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found | النقطة المطلوبة غير موجودة',
    path: req.originalUrl
  });
});

// Global error handler
// معالج الأخطاء العام
app.use((err, req, res, next) => {
  console.error('Error | خطأ:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error | خطأ في الخادم';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack })
  });
});

// ============================================
// DATABASE INITIALIZATION
// ============================================

/**
 * Initialize database and start server
 * تهيئة قاعدة البيانات وبدء الخادم
 */
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✓ Database initialized successfully | تم تهيئة قاعدة البيانات بنجاح');

    // Start server
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || 'localhost';

    app.listen(PORT, HOST, () => {
      console.log(`✓ Server running on http://${HOST}:${PORT}`);
      console.log(`✓ الخادم يعمل على http://${HOST}:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server | فشل في بدء الخادم:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection | رفض غير معالج:', err);
  process.exit(1);
});

module.exports = app;
