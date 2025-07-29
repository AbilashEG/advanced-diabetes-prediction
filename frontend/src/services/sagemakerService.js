// SageMaker API Service for diabetes prediction
import AWS from 'aws-sdk';

// Enhanced AWS SDK configuration with proper credential handling
const configureAWS = () => {
  // Option 1: Use environment variables (for development with backend proxy)
  if (process.env.REACT_APP_USE_BACKEND_PROXY === 'true') {
    console.log('🔧 Using backend proxy for SageMaker calls');
    return null; // Skip AWS configuration when using proxy
  }

  // Option 2: Configure AWS SDK for direct calls
  const awsConfig = {
    region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
    // For development: Use AWS CLI configured credentials
    // For production: Use IAM roles or temporary credentials
  };

  // Add credentials if provided via environment variables
  if (process.env.REACT_APP_AWS_ACCESS_KEY_ID && process.env.REACT_APP_AWS_SECRET_ACCESS_KEY) {
    awsConfig.accessKeyId = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
    awsConfig.secretAccessKey = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;
    console.log('🔐 Using environment variable credentials');
  } else {
    console.log('🔧 Using AWS CLI configured credentials');
  }

  AWS.config.update(awsConfig);
  console.log('⚙️ AWS SDK configured for region:', awsConfig.region);
  return new AWS.SageMakerRuntime();
};

// Initialize SageMaker Runtime
const sagemakerRuntime = configureAWS();

// Enhanced diabetes prediction service
export const predictDiabetesRisk = async (patientData) => {
  try {
    console.log('🔄 Sending prediction request to SageMaker endpoint...');
    console.log('📊 Patient data:', patientData);
    console.log('🎯 Endpoint:', process.env.REACT_APP_SAGEMAKER_ENDPOINT);
    console.log('🌍 Region:', process.env.REACT_APP_AWS_REGION);
    console.log('🔧 Use Backend Proxy:', process.env.REACT_APP_USE_BACKEND_PROXY);

    // Validate input data
    if (!patientData || typeof patientData !== 'object') {
      throw new Error('Invalid patient data provided');
    }

    // Required fields for your diabetes model
    const requiredFields = [
      'Age', 'BMI', 'Waist_Circumference_cm', 'Fasting_Glucose_mg_dL',
      'HbA1c_percent', 'Systolic_BP_mmHg', 'Diastolic_BP_mmHg',
      'Family_History_Diabetes', 'Hypertension', 'Physical_Activity_Hours_Week'
    ];

    // Check for missing fields
    const missingFields = requiredFields.filter(field => 
      patientData[field] === undefined || patientData[field] === null || patientData[field] === ''
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Decide whether to use backend proxy or direct SageMaker call
    if (process.env.REACT_APP_USE_BACKEND_PROXY === 'true') {
      console.log('📡 Using backend proxy for prediction');
      return await predictDiabetesRiskViaBackend(patientData);
    }

    // Direct SageMaker call
    if (!sagemakerRuntime) {
      throw new Error('SageMaker runtime not initialized. Check AWS configuration.');
    }

    // Prepare SageMaker request parameters
    const params = {
      EndpointName: process.env.REACT_APP_SAGEMAKER_ENDPOINT,
      ContentType: 'application/json',
      Body: JSON.stringify(patientData)
    };

    console.log('📤 SageMaker request params:', {
      ...params,
      Body: 'Patient data (hidden for security)'
    });

    // Make the prediction request
    const startTime = Date.now();
    const response = await sagemakerRuntime.invokeEndpoint(params).promise();
    const endTime = Date.now();
    
    console.log(`⚡ SageMaker response received in ${endTime - startTime}ms`);
    
    // Parse the response
    const responseBody = response.Body.toString();
    console.log('📥 Raw SageMaker response:', responseBody);
    
    let result;
    try {
      result = JSON.parse(responseBody);
    } catch (parseError) {
      console.error('❌ Failed to parse SageMaker response:', parseError);
      throw new Error('Invalid response format from prediction service');
    }
    
    console.log('✅ Parsed SageMaker result:', result);
    
    // Validate response structure
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response structure from SageMaker endpoint');
    }

    if (result.error) {
      throw new Error(`Model error: ${result.error}`);
    }

    if (result.risk_level === undefined || result.probability === undefined) {
      throw new Error('Invalid response format: missing risk_level or probability');
    }

    // Enhance response with additional metadata
    const enhancedResult = {
      ...result,
      endpoint_name: process.env.REACT_APP_SAGEMAKER_ENDPOINT,
      aws_region: process.env.REACT_APP_AWS_REGION,
      response_time_ms: endTime - startTime,
      model_accuracy: process.env.REACT_APP_MODEL_ACCURACY,
      processed_at: new Date().toISOString(),
      api_method: 'direct_sagemaker'
    };

    console.log('🎉 Enhanced prediction result:', enhancedResult);
    return enhancedResult;
    
  } catch (error) {
    console.error('❌ SageMaker prediction error:', error);
    
    // Handle specific AWS error types
    if (error.code === 'ValidationException') {
      throw new Error('Invalid input data format. Please check all required fields are provided correctly.');
    } else if (error.code === 'ModelError') {
      throw new Error('Machine learning model prediction failed. Please try again or contact support.');
    } else if (error.code === 'ServiceUnavailable') {
      throw new Error('Prediction service is temporarily unavailable. Please try again in a few moments.');
    } else if (error.code === 'ThrottlingException') {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (error.name === 'NetworkError' || error.code === 'NetworkingError') {
      throw new Error('Network connection issue. Please check your internet connection and try again.');
    } else if (error.code === 'UnknownEndpoint') {
      throw new Error('SageMaker endpoint not found. Please verify the endpoint configuration.');
    } else if (error.code === 'AccessDenied') {
      throw new Error('Access denied to SageMaker endpoint. Please check your AWS credentials.');
    } else if (error.code === 'CredentialsError' || error.message.includes('credentials')) {
      throw new Error('AWS credentials not configured. Please set up AWS CLI or use environment variables.');
    } else {
      // Generic error handling
      const errorMessage = error.message || 'An unexpected error occurred during prediction';
      throw new Error(`Prediction service error: ${errorMessage}`);
    }
  }
};

// Enhanced backend proxy implementation
export const predictDiabetesRiskViaBackend = async (patientData) => {
  try {
    console.log('🔄 Sending prediction request via backend proxy...');
    console.log('📡 Backend URL:', process.env.REACT_APP_API_URL);
    
    const response = await fetch(`${process.env.REACT_APP_API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(patientData),
      // Add timeout for better error handling
      timeout: 30000 // 30 seconds
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend response error:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    // Enhance backend response
    const enhancedResult = {
      ...result,
      api_method: 'backend_proxy',
      processed_at: new Date().toISOString()
    };
    
    console.log('✅ Backend prediction result:', enhancedResult);
    return enhancedResult;
    
  } catch (error) {
    console.error('❌ Backend prediction error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Backend service unavailable. Please check if the backend server is running on port 3001.');
    } else if (error.name === 'AbortError') {
      throw new Error('Request timeout. The backend service is taking too long to respond.');
    } else {
      throw new Error(`Backend prediction failed: ${error.message}`);
    }
  }
};

// Enhanced health check function
export const checkEndpointHealth = async () => {
  try {
    console.log('🏥 Checking SageMaker endpoint health...');
    
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

    const startTime = Date.now();
    await predictDiabetesRisk(testData);
    const endTime = Date.now();
    
    console.log('✅ Endpoint health check passed');
    return { 
      status: 'healthy', 
      endpoint: process.env.REACT_APP_SAGEMAKER_ENDPOINT,
      response_time_ms: endTime - startTime,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Endpoint health check failed:', error);
    return { 
      status: 'unhealthy', 
      endpoint: process.env.REACT_APP_SAGEMAKER_ENDPOINT,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Service configuration and utilities
const sagemakerService = {
  predictDiabetesRisk,
  predictDiabetesRiskViaBackend,
  checkEndpointHealth,
  config: {
    endpoint: process.env.REACT_APP_SAGEMAKER_ENDPOINT,
    region: process.env.REACT_APP_AWS_REGION,
    modelVersion: process.env.REACT_APP_MODEL_VERSION,
    modelAccuracy: process.env.REACT_APP_MODEL_ACCURACY,
    useBackendProxy: process.env.REACT_APP_USE_BACKEND_PROXY === 'true'
  }
};

export default sagemakerService;
