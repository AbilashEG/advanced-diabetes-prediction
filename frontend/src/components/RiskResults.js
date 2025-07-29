import React, { useState } from 'react';
import { Card, Row, Col, Button, Badge, ProgressBar, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle, 
  faCheckCircle, 
  faInfoCircle,
  faRedo,
  faStethoscope,
  faChartLine,
  faHeartbeat,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import Recommendations from './Recommendations';
import { downloadReportAsPDF } from '../services/pdfService';

function RiskResults({ result, patientData, onReset }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      setDownloadError(null);
      
      const patientName = patientData?.name || 'Patient';
      const timestamp = new Date().getTime();
      const filename = `diabetes-risk-assessment-${patientName}-${timestamp}.pdf`;
      
      const downloadResult = await downloadReportAsPDF('diabetes-report', filename);
      
      if (!downloadResult.success) {
        setDownloadError(downloadResult.error);
      }
    } catch (error) {
      setDownloadError('Error generating PDF. Please try again.');
      console.error('PDF download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High Risk': return 'danger';
      case 'Moderate Risk': return 'warning';
      case 'Low Risk': return 'success';
      default: return 'secondary';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'High Risk': return faExclamationTriangle;
      case 'Moderate Risk': return faInfoCircle;
      case 'Low Risk': return faCheckCircle;
      default: return faInfoCircle;
    }
  };

  const getRiskDescription = (riskLevel, probability) => {
    const probPercent = probability * 100;
    
    switch (riskLevel) {
      case 'High Risk':
        return `High probability (${probPercent.toFixed(1)}%) of developing diabetes. Immediate medical attention and lifestyle interventions recommended.`;
      case 'Moderate Risk':
        return `Moderate risk (${probPercent.toFixed(1)}%) of diabetes development. Preventive measures and regular monitoring advised.`;
      case 'Low Risk':
        return `Low risk (${probPercent.toFixed(1)}%) of diabetes development. Continue healthy lifestyle practices and routine check-ups.`;
      default:
        return `Risk assessment completed with ${probPercent.toFixed(1)}% probability.`;
    }
  };

  const probability = result.probability * 100;

  return (
    <div className="risk-results">
      {/* Download Section - Will be hidden in PDF */}
      <Row className="mb-4 no-print">
        <Col className="text-center">
          <div className="download-section">
            <Button 
              variant="success"
              size="lg"
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="download-btn me-3"
            >
              <FontAwesomeIcon icon={faDownload} className="me-2" />
              {isDownloading ? 'Generating PDF...' : 'Download Report as PDF'}
            </Button>
            
            <Button variant="outline-secondary" onClick={onReset}>
              <FontAwesomeIcon icon={faRedo} className="me-2" />
              New Assessment
            </Button>
            
            {downloadError && (
              <Alert variant="danger" className="mt-3 mx-auto" style={{ maxWidth: '500px' }}>
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                {downloadError}
              </Alert>
            )}
          </div>
        </Col>
      </Row>

      {/* PDF Report Content - This will be converted to PDF */}
      <div id="diabetes-report" className="report-content">
        
        {/* Report Header */}
        <Row className="mb-4">
          <Col>
            <div className="text-center report-header">
              <h1 className="mb-3">
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                Diabetes Risk Assessment Report
              </h1>
              <p className="text-muted mb-3">
                Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
              <p className="text-muted mb-3">
                Analysis completed using AWS SageMaker endpoint: {process.env.REACT_APP_SAGEMAKER_ENDPOINT}
              </p>
            </div>
          </Col>
        </Row>

        {/* Risk Summary Card */}
        <Row className="mb-4">
          <Col lg={10} className="mx-auto">
            <Card className={`border-${getRiskColor(result.risk_level)} shadow-lg risk-summary-card`}>
              <Card.Header className={`bg-${getRiskColor(result.risk_level)} text-white`}>
                <div className="d-flex align-items-center justify-content-between">
                  <h3 className="mb-0">
                    <FontAwesomeIcon icon={getRiskIcon(result.risk_level)} className="me-2" />
                    Risk Assessment Summary
                  </h3>
                  <div>
                    <Badge bg="light" text="dark" className="me-2">
                      Model v{result.model_version || '1.0'}
                    </Badge>
                    <Badge bg="light" text="dark">
                      {process.env.REACT_APP_MODEL_ACCURACY || '95'}% Accuracy
                    </Badge>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  <Col md={6} className="text-center">
                    <div className="risk-indicator mb-4">
                      <div className="probability-circle">
                        <h1 className={`display-2 text-${getRiskColor(result.risk_level)} mb-0`}>
                          {probability.toFixed(1)}%
                        </h1>
                      </div>
                      <h4 className={`text-${getRiskColor(result.risk_level)} mb-3`}>
                        {result.risk_level}
                      </h4>
                      <ProgressBar 
                        variant={getRiskColor(result.risk_level)}
                        now={probability}
                        className="mb-3"
                        style={{ height: '12px' }}
                        label={`${probability.toFixed(1)}%`}
                      />
                      <p className="text-muted">
                        Diabetes Development Probability
                      </p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <h5 className="mb-3">
                      <FontAwesomeIcon icon={faHeartbeat} className="me-2" />
                      Patient Profile Summary
                    </h5>
                    <div className="patient-summary">
                      <Row className="mb-2">
                        <Col sm={5}><strong>Age:</strong></Col>
                        <Col sm={7}>{result.patient_info?.age || patientData?.age} years</Col>
                      </Row>
                      <Row className="mb-2">
                        <Col sm={5}><strong>BMI:</strong></Col>
                        <Col sm={7}>{result.patient_info?.bmi || patientData?.bmi} kg/m²</Col>
                      </Row>
                      <Row className="mb-2">
                        <Col sm={5}><strong>Fasting Glucose:</strong></Col>
                        <Col sm={7}>{result.patient_info?.glucose || patientData?.glucose} mg/dL</Col>
                      </Row>
                      <Row className="mb-2">
                        <Col sm={5}><strong>HbA1c:</strong></Col>
                        <Col sm={7}>{result.patient_info?.hba1c || patientData?.hba1c}%</Col>
                      </Row>
                      <Row className="mb-2">
                        <Col sm={5}><strong>Assessment Time:</strong></Col>
                        <Col sm={7}>{new Date(result.timestamp || Date.now()).toLocaleString()}</Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Risk Interpretation */}
        <Row className="mb-4">
          <Col lg={10} className="mx-auto">
            <Card className="border-info">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faStethoscope} className="me-2" />
                  Clinical Interpretation & Next Steps
                </h5>
              </Card.Header>
              <Card.Body>
                <Alert variant={getRiskColor(result.risk_level)} className="mb-3">
                  <Alert.Heading className="h6">
                    <FontAwesomeIcon icon={getRiskIcon(result.risk_level)} className="me-2" />
                    {result.risk_level} Classification
                  </Alert.Heading>
                  <p className="mb-0">
                    {getRiskDescription(result.risk_level, result.probability)}
                  </p>
                </Alert>

                <div className="clinical-notes">
                  <h6 className="mb-3">Clinical Notes:</h6>
                  <ul className="mb-0">
                    {result.risk_level === 'High Risk' && (
                      <>
                        <li>Immediate consultation with healthcare provider recommended</li>
                        <li>Consider comprehensive diabetes screening and monitoring</li>
                        <li>Implement aggressive lifestyle interventions</li>
                        <li>Monitor blood glucose and HbA1c levels regularly</li>
                      </>
                    )}
                    {result.risk_level === 'Moderate Risk' && (
                      <>
                        <li>Schedule follow-up with healthcare provider within 3-6 months</li>
                        <li>Implement preventive lifestyle modifications</li>
                        <li>Regular monitoring of glucose levels recommended</li>
                        <li>Consider nutritional counseling and fitness program</li>
                      </>
                    )}
                    {result.risk_level === 'Low Risk' && (
                      <>
                        <li>Continue current healthy lifestyle practices</li>
                        <li>Maintain regular healthcare check-ups</li>
                        <li>Annual diabetes screening recommended if family history present</li>
                        <li>Stay vigilant for any changes in health status</li>
                      </>
                    )}
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recommendations Section */}
        {result.recommendations && (
          <Row className="mb-4">
            <Col lg={10} className="mx-auto">
              <Recommendations 
                recommendations={result.recommendations} 
                riskLevel={result.risk_level}
                probability={result.probability}
              />
            </Col>
          </Row>
        )}

        {/* Model Information & Disclaimer */}
        <Row className="mt-4">
          <Col lg={10} className="mx-auto">
            <Card className="bg-light border-0">
              <Card.Body className="text-center py-4">
                <h6 className="mb-3">
                  <FontAwesomeIcon icon={faChartLine} className="me-2" />
                  AI Model Information & Disclaimer
                </h6>
                <div className="model-info mb-3">
                  <Row>
                    <Col md={3}>
                      <strong>Model Type:</strong><br />
                      <span className="text-muted">Logistic Regression</span>
                    </Col>
                    <Col md={3}>
                      <strong>Accuracy:</strong><br />
                      <span className="text-success">{process.env.REACT_APP_MODEL_ACCURACY || '95'}%</span>
                    </Col>
                    <Col md={3}>
                      <strong>Endpoint:</strong><br />
                      <span className="text-primary">{process.env.REACT_APP_SAGEMAKER_ENDPOINT || 'SageMaker'}</span>
                    </Col>
                    <Col md={3}>
                      <strong>Region:</strong><br />
                      <span className="text-info">{process.env.REACT_APP_AWS_REGION || 'us-east-1'}</span>
                    </Col>
                  </Row>
                </div>
                <p className="text-muted mb-0 small">
                  <strong>Important:</strong> This AI-generated risk assessment is for informational purposes only 
                  and should not replace professional medical advice, diagnosis, or treatment. Always consult with 
                  qualified healthcare professionals for medical decisions. The model predictions are based on 
                  statistical patterns and individual cases may vary.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default RiskResults;
