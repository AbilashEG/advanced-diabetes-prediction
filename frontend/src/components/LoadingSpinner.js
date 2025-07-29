import React from 'react';
import { Spinner, Row, Col, ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faHeartbeat, faChartLine, faStethoscope } from '@fortawesome/free-solid-svg-icons';

function LoadingSpinner() {
  return (
    <Row className="justify-content-center text-center py-5">
      <Col md={8}>
        <div className="loading-container">
          {/* Main AI Icon */}
          <div className="mb-4">
            <FontAwesomeIcon 
              icon={faBrain} 
              size="4x" 
              className="text-primary mb-3 pulse-animation" 
            />
          </div>
          
          {/* Main Title */}
          <h3 className="mb-3">
            <FontAwesomeIcon icon={faHeartbeat} className="me-2 text-danger" />
            Analyzing Health Data...
          </h3>
          
          {/* Description */}
          <p className="text-muted mb-4 lead">
            Our advanced AI model is processing your health information to provide 
            personalized diabetes risk assessment and evidence-based recommendations.
          </p>
          
          {/* Progress Indicator */}
          <div className="mb-4">
            <ProgressBar 
              animated 
              now={100} 
              variant="primary" 
              style={{ height: '8px' }}
              className="mb-3"
            />
          </div>
          
          {/* Main Spinner */}
          <div className="mb-4">
            <Spinner 
              animation="border" 
              variant="primary" 
              style={{ width: '3rem', height: '3rem' }}
            />
          </div>
          
          {/* Processing Steps */}
          <div className="processing-steps mb-4">
            <div className="row text-center">
              <div className="col-md-3 mb-3">
                <FontAwesomeIcon icon={faChartLine} className="text-info mb-2" size="2x" />
                <br />
                <small className="text-muted">
                  <strong>Data Validation</strong><br />
                  Verifying input parameters
                </small>
              </div>
              <div className="col-md-3 mb-3">
                <FontAwesomeIcon icon={faBrain} className="text-warning mb-2" size="2x" />
                <br />
                <small className="text-muted">
                  <strong>AI Processing</strong><br />
                  Running prediction algorithm
                </small>
              </div>
              <div className="col-md-3 mb-3">
                <FontAwesomeIcon icon={faStethoscope} className="text-success mb-2" size="2x" />
                <br />
                <small className="text-muted">
                  <strong>Risk Analysis</strong><br />
                  Calculating probability scores
                </small>
              </div>
              <div className="col-md-3 mb-3">
                <FontAwesomeIcon icon={faHeartbeat} className="text-danger mb-2" size="2x" />
                <br />
                <small className="text-muted">
                  <strong>Recommendations</strong><br />
                  Generating personalized advice
                </small>
              </div>
            </div>
          </div>
          
          {/* Technical Information */}
          <div className="technical-info p-3 bg-light rounded">
            <div className="row text-center">
              <div className="col-md-4">
                <strong className="text-primary">🧠 AWS SageMaker</strong><br />
                <small className="text-muted">Enterprise ML Platform</small>
              </div>
              <div className="col-md-4">
                <strong className="text-success">📊 {process.env.REACT_APP_MODEL_ACCURACY}% Accuracy</strong><br />
                <small className="text-muted">Clinically Validated</small>
              </div>
              <div className="col-md-4">
                <strong className="text-info">⚡ Real-time</strong><br />
                <small className="text-muted">Instant Analysis</small>
              </div>
            </div>
          </div>
          
          {/* Endpoint Information */}
          <div className="mt-3">
            <small className="text-muted">
              <strong>Endpoint:</strong> {process.env.REACT_APP_SAGEMAKER_ENDPOINT}<br />
              <strong>Region:</strong> {process.env.REACT_APP_AWS_REGION} | 
              <strong>Model:</strong> v{process.env.REACT_APP_MODEL_VERSION}
            </small>
          </div>
          
          {/* Loading Message */}
          <div className="mt-4">
            <p className="text-muted mb-0">
              <span className="loading-dots">
                Processing your health data securely
                <span className="dot-1">.</span>
                <span className="dot-2">.</span>
                <span className="dot-3">.</span>
              </span>
            </p>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default LoadingSpinner;
