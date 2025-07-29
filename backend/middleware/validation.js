const logger = require('../utils/logger');

// Validate diabetes prediction input
const validatePredictionInput = (req, res, next) => {
  try {
    const patientData = req.body;
    
    // Required fields for diabetes model
    const requiredFields = [
      'Age', 'BMI', 'Waist_Circumference_cm', 'Fasting_Glucose_mg_dL',
      'HbA1c_percent', 'Systolic_BP_mmHg', 'Diastolic_BP_mmHg',
      'Family_History_Diabetes', 'Hypertension', 'Physical_Activity_Hours_Week'
    ];

    // Check for missing fields
    const missingFields = requiredFields.filter(field => 
      patientData[field] === undefined || 
      patientData[field] === null || 
      patientData[field] === ''
    );

    if (missingFields.length > 0) {
      logger.warn('Validation failed: Missing required fields', { 
        missingFields,
        clientIP: req.ip 
      });
      return res.status(400).json({
        error: 'Missing required fields',
        missing_fields: missingFields,
        timestamp: new Date().toISOString()
      });
    }

    // Validate data types and ranges
    const validationErrors = [];

    // Age validation (18-120)
    if (isNaN(patientData.Age) || patientData.Age < 18 || patientData.Age > 120) {
      validationErrors.push('Age must be a number between 18 and 120');
    }

    // BMI validation (10-60)
    if (isNaN(patientData.BMI) || patientData.BMI < 10 || patientData.BMI > 60) {
      validationErrors.push('BMI must be a number between 10 and 60');
    }

    // Waist circumference validation (30-200 cm)
    if (isNaN(patientData.Waist_Circumference_cm) || 
        patientData.Waist_Circumference_cm < 30 || 
        patientData.Waist_Circumference_cm > 200) {
      validationErrors.push('Waist circumference must be between 30 and 200 cm');
    }

    // Glucose validation (50-500 mg/dL)
    if (isNaN(patientData.Fasting_Glucose_mg_dL) || 
        patientData.Fasting_Glucose_mg_dL < 50 || 
        patientData.Fasting_Glucose_mg_dL > 500) {
      validationErrors.push('Fasting glucose must be between 50 and 500 mg/dL');
    }

    // HbA1c validation (3-20%)
    if (isNaN(patientData.HbA1c_percent) || 
        patientData.HbA1c_percent < 3 || 
        patientData.HbA1c_percent > 20) {
      validationErrors.push('HbA1c must be between 3 and 20%');
    }

    // Blood pressure validation
    if (isNaN(patientData.Systolic_BP_mmHg) || 
        patientData.Systolic_BP_mmHg < 70 || 
        patientData.Systolic_BP_mmHg > 300) {
      validationErrors.push('Systolic BP must be between 70 and 300 mmHg');
    }

    if (isNaN(patientData.Diastolic_BP_mmHg) || 
        patientData.Diastolic_BP_mmHg < 40 || 
        patientData.Diastolic_BP_mmHg > 200) {
      validationErrors.push('Diastolic BP must be between 40 and 200 mmHg');
    }

    // Binary fields validation (0 or 1)
    if (![0, 1].includes(Number(patientData.Family_History_Diabetes))) {
      validationErrors.push('Family_History_Diabetes must be 0 or 1');
    }

    if (![0, 1].includes(Number(patientData.Hypertension))) {
      validationErrors.push('Hypertension must be 0 or 1');
    }

    // Physical activity validation (0-50 hours/week)
    if (isNaN(patientData.Physical_Activity_Hours_Week) || 
        patientData.Physical_Activity_Hours_Week < 0 || 
        patientData.Physical_Activity_Hours_Week > 50) {
      validationErrors.push('Physical activity must be between 0 and 50 hours per week');
    }

    if (validationErrors.length > 0) {
      logger.warn('Validation failed: Invalid data ranges', { 
        validationErrors,
        clientIP: req.ip 
      });
      return res.status(400).json({
        error: 'Invalid data ranges',
        validation_errors: validationErrors,
        timestamp: new Date().toISOString()
      });
    }

    // Convert string numbers to actual numbers
    req.body = {
      Age: Number(patientData.Age),
      BMI: Number(patientData.BMI),
      Waist_Circumference_cm: Number(patientData.Waist_Circumference_cm),
      Fasting_Glucose_mg_dL: Number(patientData.Fasting_Glucose_mg_dL),
      HbA1c_percent: Number(patientData.HbA1c_percent),
      Systolic_BP_mmHg: Number(patientData.Systolic_BP_mmHg),
      Diastolic_BP_mmHg: Number(patientData.Diastolic_BP_mmHg),
      Family_History_Diabetes: Number(patientData.Family_History_Diabetes),
      Hypertension: Number(patientData.Hypertension),
      Physical_Activity_Hours_Week: Number(patientData.Physical_Activity_Hours_Week)
    };

    logger.info('Input validation successful', { clientIP: req.ip });
    next();

  } catch (error) {
    logger.error('Validation middleware error', { error: error.message, clientIP: req.ip });
    res.status(500).json({
      error: 'Validation processing failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  validatePredictionInput
};
