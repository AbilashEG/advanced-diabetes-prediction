import React, { useState } from 'react';
import { Form, Button, Row, Col, InputGroup, Card, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faWeight, 
  faRuler, 
  faVial, 
  faHeartbeat, 
  faDumbbell,
  faStethoscope,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';

function PatientForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    Age: '',
    BMI: '',
    Waist_Circumference_cm: '',
    Fasting_Glucose_mg_dL: '',
    HbA1c_percent: '',
    Systolic_BP_mmHg: '',
    Diastolic_BP_mmHg: '',
    Family_History_Diabetes: '0',
    Hypertension: '0',
    Physical_Activity_Hours_Week: ''
  });

  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert string values to numbers for the SageMaker endpoint
      const processedData = {
        Age: parseFloat(formData.Age),
        BMI: parseFloat(formData.BMI),
        Waist_Circumference_cm: parseFloat(formData.Waist_Circumference_cm),
        Fasting_Glucose_mg_dL: parseFloat(formData.Fasting_Glucose_mg_dL),
        HbA1c_percent: parseFloat(formData.HbA1c_percent),
        Systolic_BP_mmHg: parseFloat(formData.Systolic_BP_mmHg),
        Diastolic_BP_mmHg: parseFloat(formData.Diastolic_BP_mmHg),
        Family_History_Diabetes: parseInt(formData.Family_History_Diabetes),
        Hypertension: parseInt(formData.Hypertension),
        Physical_Activity_Hours_Week: parseFloat(formData.Physical_Activity_Hours_Week)
      };

      console.log('Processed form data for SageMaker:', processedData);
      
      await onSubmit(processedData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      {/* Information Alert */}
      <Alert variant="info" className="mb-4">
        <Alert.Heading>
          <FontAwesomeIcon icon={faStethoscope} className="me-2" />
          Clinical Information Required
        </Alert.Heading>
        <p className="mb-0">
          Please provide accurate health measurements for the most reliable diabetes risk assessment.
          All fields are required for optimal prediction accuracy.
        </p>
      </Alert>

      {/* Basic Information */}
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Basic Information
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Age (years)
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    name="Age"
                    value={formData.Age}
                    onChange={handleChange}
                    min="18"
                    max="100"
                    required
                    placeholder="Enter age"
                  />
                  <InputGroup.Text>years</InputGroup.Text>
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  Please provide a valid age between 18-100 years.
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Age is a significant factor in diabetes risk assessment
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faWeight} className="me-2" />
                  BMI (Body Mass Index)
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    name="BMI"
                    value={formData.BMI}
                    onChange={handleChange}
                    min="15"
                    max="50"
                    step="0.1"
                    required
                    placeholder="Enter BMI"
                  />
                  <InputGroup.Text>kg/m²</InputGroup.Text>
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  Please provide a valid BMI between 15-50.
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Normal: 18.5-24.9 | Overweight: 25-29.9 | Obese: &ge;30
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faRuler} className="me-2" />
                  Waist Circumference
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    name="Waist_Circumference_cm"
                    value={formData.Waist_Circumference_cm}
                    onChange={handleChange}
                    min="50"
                    max="200"
                    required
                    placeholder="Enter waist circumference"
                  />
                  <InputGroup.Text>cm</InputGroup.Text>
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  Please provide a valid waist circumference.
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Risk increases: Men &gt;102cm, Women &gt;88cm
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faDumbbell} className="me-2" />
                  Physical Activity
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    name="Physical_Activity_Hours_Week"
                    value={formData.Physical_Activity_Hours_Week}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    step="0.5"
                    required
                    placeholder="Hours per week"
                  />
                  <InputGroup.Text>hrs/week</InputGroup.Text>
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  Please provide valid activity hours per week.
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Recommended: 150+ minutes/week moderate activity
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Clinical Measurements */}
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faVial} className="me-2" />
            Clinical Measurements
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faVial} className="me-2" />
                  Fasting Glucose
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    name="Fasting_Glucose_mg_dL"
                    value={formData.Fasting_Glucose_mg_dL}
                    onChange={handleChange}
                    min="50"
                    max="300"
                    required
                    placeholder="Enter fasting glucose"
                  />
                  <InputGroup.Text>mg/dL</InputGroup.Text>
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  Please provide a valid glucose level.
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Normal: 70-99 | Prediabetic: 100-125 | Diabetic: &ge;126
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faVial} className="me-2" />
                  HbA1c (Hemoglobin A1c)
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    name="HbA1c_percent"
                    value={formData.HbA1c_percent}
                    onChange={handleChange}
                    min="3"
                    max="15"
                    step="0.1"
                    required
                    placeholder="Enter HbA1c"
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  Please provide a valid HbA1c percentage.
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Normal: &lt;5.7% | Prediabetic: 5.7-6.4% | Diabetic: &ge;6.5%
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faHeartbeat} className="me-2" />
                  Systolic Blood Pressure
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    name="Systolic_BP_mmHg"
                    value={formData.Systolic_BP_mmHg}
                    onChange={handleChange}
                    min="80"
                    max="220"
                    required
                    placeholder="Enter systolic BP"
                  />
                  <InputGroup.Text>mmHg</InputGroup.Text>
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  Please provide a valid systolic blood pressure.
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Normal: &lt;120 | Elevated: 120-129 | High: &ge;130
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faHeartbeat} className="me-2" />
                  Diastolic Blood Pressure
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    name="Diastolic_BP_mmHg"
                    value={formData.Diastolic_BP_mmHg}
                    onChange={handleChange}
                    min="40"
                    max="140"
                    required
                    placeholder="Enter diastolic BP"
                  />
                  <InputGroup.Text>mmHg</InputGroup.Text>
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  Please provide a valid diastolic blood pressure.
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Normal: &lt;80 | High: &ge;80
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Medical History */}
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faStethoscope} className="me-2" />
            Medical History
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Family History of Diabetes
                </Form.Label>
                <Form.Select
                  name="Family_History_Diabetes"
                  value={formData.Family_History_Diabetes}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select family history status</option>
                  <option value="0">No family history of diabetes</option>
                  <option value="1">Yes, family history present</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select family history status.
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Family history significantly increases diabetes risk
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faHeartbeat} className="me-2" />
                  Hypertension (High Blood Pressure)
                </Form.Label>
                <Form.Select
                  name="Hypertension"
                  value={formData.Hypertension}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select hypertension status</option>
                  <option value="0">No hypertension</option>
                  <option value="1">Yes, hypertension present</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select hypertension status.
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Hypertension often coexists with diabetes
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Submit Button */}
      <div className="text-center">
        <Button 
          variant="primary" 
          size="lg" 
          type="submit"
          className="px-5 py-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Analyzing...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faChartLine} className="me-2" />
              Analyze Diabetes Risk
            </>
          )}
        </Button>
        <div className="mt-3">
          <small className="text-muted">
            <FontAwesomeIcon icon={faStethoscope} className="me-1" />
            Powered by AWS SageMaker • {process.env.REACT_APP_MODEL_ACCURACY}% Accuracy • 
            Model v{process.env.REACT_APP_MODEL_VERSION}
          </small>
        </div>
      </div>
    </Form>
  );
}

export default PatientForm;
