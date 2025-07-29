const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import custom modules
const predictionRoutes = require('./routes/prediction');
const { testAWSConnection } = require('./config/aws-config');
const logger = require('./utils/logger');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    retry_after: '15 minutes',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Request ID middleware
app.use((req, res, next) => {
  req.requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.set('X-Request-ID', req.requestId);
  next();
});

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Diabetes Prediction Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      prediction: '/api/predict',
      batch_prediction: '/api/predict-batch',
      endpoint_health: '/api/endpoint-health'
    }
  });
});

// API routes
app.use('/api', predictionRoutes);

// 404 handler
app.use('*', (req, res) => {
  logger.warn('404 - Route not found', { 
    url: req.originalUrl,
    method: req.method,
    ip: req.ip 
  });
  
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  res.status(500).json({
    error: 'Internal server error',
    request_id: req.requestId,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after 10 seconds');
    process.exit(1);
  }, 10000);
};

// Start server
const server = app.listen(PORT, async () => {
  console.log('\n🚀 ===== DIABETES PREDICTION BACKEND STARTED =====');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎯 SageMaker Endpoint: ${process.env.SAGEMAKER_ENDPOINT}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`📊 Rate limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${(parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 60000} minutes`);
  
  // Test AWS connection
  console.log('\n🔍 Testing AWS SageMaker connection...');
  const awsConnected = await testAWSConnection();
  
  if (awsConnected) {
    console.log('✅ AWS SageMaker connection successful');
  } else {
    console.log('❌ AWS SageMaker connection failed - check credentials');
  }
  
  console.log('\n📋 Available endpoints:');
  console.log(`   GET  /                     - API information`);
  console.log(`   GET  /api/health           - Backend health check`);
  console.log(`   GET  /api/endpoint-health  - SageMaker endpoint health`);
  console.log(`   POST /api/predict          - Single patient prediction`);
  console.log(`   POST /api/predict-batch    - Batch patient predictions`);
  
  console.log('\n🎉 Backend ready to serve diabetes predictions!');
  console.log('====================================================\n');
  
  logger.info('Diabetes prediction backend started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV,
    endpoint: process.env.SAGEMAKER_ENDPOINT
  });
});

// Handle process termination
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

module.exports = app;
