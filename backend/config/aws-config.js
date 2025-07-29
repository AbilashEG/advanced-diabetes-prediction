const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS SDK
const configureAWS = () => {
  const awsConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    apiVersion: 'latest'
  };

  // Use environment variables if provided
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    awsConfig.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    awsConfig.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    console.log('🔐 Using environment variable credentials');
  } else {
    console.log('🔧 Using AWS CLI configured credentials');
  }

  AWS.config.update(awsConfig);
  
  return {
    sagemakerRuntime: new AWS.SageMakerRuntime(),
    sagemaker: new AWS.SageMaker() // Add regular SageMaker service for management operations
  };
};

// Initialize both SageMaker services
const { sagemakerRuntime, sagemaker } = configureAWS();

// FIXED: Test AWS connection using correct service and method
const testAWSConnection = async () => {
  try {
    console.log('🔍 Testing AWS credentials and permissions...');
    
    // Option 1: Test with SageMaker service (for listing endpoints)
    try {
      await sagemaker.listEndpoints({ MaxResults: 1 }).promise();
      console.log('✅ AWS SageMaker service connection successful');
      return true;
    } catch (listError) {
      console.log('⚠️ SageMaker list permission not available, trying direct endpoint test...');
      
      // Option 2: Test with a direct endpoint call using dummy data
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
        EndpointName: process.env.SAGEMAKER_ENDPOINT,
        ContentType: 'application/json',
        Body: JSON.stringify(testData)
      };

      await sagemakerRuntime.invokeEndpoint(params).promise();
      console.log('✅ AWS SageMaker Runtime connection successful (endpoint tested)');
      return true;
    }
    
  } catch (error) {
    console.error('❌ AWS connection test failed:', error.message);
    
    // Provide helpful error messages
    if (error.code === 'AccessDenied') {
      console.error('🔐 Access denied - check your AWS credentials and permissions');
    } else if (error.code === 'UnknownEndpoint') {
      console.error('🎯 SageMaker endpoint not found or incorrect endpoint name');
    } else if (error.code === 'CredentialsError') {
      console.error('🔑 AWS credentials not configured properly');
    } else if (error.code === 'NetworkingError') {
      console.error('🌐 Network connection issue - check internet connectivity');
    }
    
    return false;
  }
};

// Enhanced endpoint validation function
const validateEndpoint = async (endpointName) => {
  try {
    console.log(`🔍 Validating endpoint: ${endpointName}`);
    
    const response = await sagemaker.describeEndpoint({
      EndpointName: endpointName
    }).promise();
    
    console.log(`✅ Endpoint validation successful:`);
    console.log(`   📍 Status: ${response.EndpointStatus}`);
    console.log(`   🏗️ Config: ${response.EndpointConfigName}`);
    console.log(`   📅 Created: ${response.CreationTime}`);
    
    return {
      isValid: true,
      status: response.EndpointStatus,
      config: response.EndpointConfigName,
      creationTime: response.CreationTime
    };
    
  } catch (error) {
    console.error(`❌ Endpoint validation failed: ${error.message}`);
    return {
      isValid: false,
      error: error.message
    };
  }
};

module.exports = {
  sagemakerRuntime,
  sagemaker,
  testAWSConnection,
  validateEndpoint,
  endpointName: process.env.SAGEMAKER_ENDPOINT
};
