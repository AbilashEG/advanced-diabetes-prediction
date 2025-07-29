const express = require('express');
const router = express.Router();
const { sagemakerRuntime, endpointName } = require('../config/aws-config');
const { validatePredictionInput } = require('../middleware/validation');
const logger = require('../utils/logger');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoint: endpointName,
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// SageMaker endpoint health check
router.get('/endpoint-health', async (req, res) => {
  try {
    // Simple test data for health check
    const testData = {
      Age: 45,
      BMI: 25.0,
      Waist_Circumference_cm: 85,
      Fasting_Glucose_mg_dL: 95,
      HbA1c_percent: 5.5,
      Systolic_BP_mmHg: 120,
      Diastolic_BP_mmHg: 80,
      Family_History_Diabetes: 0,
      Hypertension: 0,
      Physical_Activity_Hours_Week: 5.0
    };

    const params = {
      EndpointName: endpointName,
      ContentType: 'application/json',
      Body: JSON.stringify(testData)
    };

    const startTime = Date.now();
    await sagemakerRuntime.invokeEndpoint(params).promise();
    const endTime = Date.now();

    logger.info('Endpoint health check successful', { 
      responseTime: endTime - startTime,
      endpoint: endpointName 
    });

    res.json({
      status: 'healthy',
      endpoint: endpointName,
      response_time_ms: endTime - startTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Endpoint health check failed', { 
      error: error.message,
      endpoint: endpointName 
    });

    res.status(503).json({
      status: 'unhealthy',
      endpoint: endpointName,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Main prediction endpoint
router.post('/predict', validatePredictionInput, async (req, res) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    logger.info('Prediction request started', { 
      requestId,
      clientIP: req.ip,
      userAgent: req.get('User-Agent')
    });

    const patientData = req.body;

    // Prepare SageMaker request
    const params = {
      EndpointName: endpointName,
      ContentType: 'application/json',
      Body: JSON.stringify(patientData)
    };

    logger.info('Sending request to SageMaker', { 
      requestId,
      endpoint: endpointName 
    });

    // Call SageMaker endpoint
    const sagemakerStartTime = Date.now();
    const response = await sagemakerRuntime.invokeEndpoint(params).promise();
    const sagemakerEndTime = Date.now();

    // Parse response
    const result = JSON.parse(response.Body.toString());

    logger.info('SageMaker prediction successful', {
      requestId,
      sagemakerResponseTime: sagemakerEndTime - sagemakerStartTime,
      riskLevel: result.risk_level,
      probability: result.probability
    });

    // Enhance response with metadata
    const enhancedResult = {
      ...result,
      request_id: requestId,
      backend_processing_time_ms: Date.now() - startTime,
      sagemaker_response_time_ms: sagemakerEndTime - sagemakerStartTime,
      processed_at: new Date().toISOString(),
      endpoint_used: endpointName,
      backend_version: '1.0.0'
    };

    res.json(enhancedResult);

  } catch (error) {
    const endTime = Date.now();
    
    logger.error('Prediction request failed', {
      requestId,
      error: error.message,
      processingTime: endTime - startTime,
      clientIP: req.ip
    });

    // Handle specific AWS errors
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error.code === 'ValidationException') {
      statusCode = 400;
      errorMessage = 'Invalid input data format';
    } else if (error.code === 'AccessDenied') {
      statusCode = 403;
      errorMessage = 'Access denied to SageMaker endpoint';
    } else if (error.code === 'ServiceUnavailable') {
      statusCode = 503;
      errorMessage = 'SageMaker service temporarily unavailable';
    } else if (error.code === 'ThrottlingException') {
      statusCode = 429;
      errorMessage = 'Too many requests - rate limit exceeded';
    } else if (error.code === 'ModelError') {
      statusCode = 502;
      errorMessage = 'Machine learning model error';
    }

    res.status(statusCode).json({
      error: errorMessage,
      request_id: requestId,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString(),
      processing_time_ms: endTime - startTime
    });
  }
});

// Batch prediction endpoint (bonus feature)
router.post('/predict-batch', async (req, res) => {
  try {
    const patients = req.body.patients;
    
    if (!Array.isArray(patients) || patients.length === 0) {
      return res.status(400).json({
        error: 'Invalid batch data - expecting array of patients',
        timestamp: new Date().toISOString()
      });
    }

    if (patients.length > 10) {
      return res.status(400).json({
        error: 'Batch size limited to 10 patients',
        timestamp: new Date().toISOString()
      });
    }

    const results = [];
    for (let i = 0; i < patients.length; i++) {
      try {
        const params = {
          EndpointName: endpointName,
          ContentType: 'application/json',
          Body: JSON.stringify(patients[i])
        };

        const response = await sagemakerRuntime.invokeEndpoint(params).promise();
        const result = JSON.parse(response.Body.toString());
        
        results.push({
          patient_index: i,
          result: result,
          status: 'success'
        });

      } catch (error) {
        results.push({
          patient_index: i,
          error: error.message,
          status: 'failed'
        });
      }
    }

    res.json({
      batch_results: results,
      total_patients: patients.length,
      successful_predictions: results.filter(r => r.status === 'success').length,
      failed_predictions: results.filter(r => r.status === 'failed').length,
      processed_at: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Batch prediction failed', { error: error.message });
    res.status(500).json({
      error: 'Batch prediction failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
