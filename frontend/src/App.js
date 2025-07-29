import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import PatientForm from './components/PatientForm';
import RiskResults from './components/RiskResults';
import LoadingSpinner from './components/LoadingSpinner';
import { Container, Row, Col, Navbar, Nav, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartbeat, faChartLine, faUserMd, faBrain } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);

  const handlePrediction = async (patientFormData) => {
    setLoading(true);
    setError(null);
    setPatientData(patientFormData);

    try {
      // Import the SageMaker service
      const { predictDiabetesRisk } = await import('./services/sagemakerService');
      
      console.log('Making prediction with data:', patientFormData);
      
      // Make prediction
      const result = await predictDiabetesRisk(patientFormData);
      console.log('Prediction result:', result);
      
      setPredictionResult(result);
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred during prediction';
      setError(`Prediction failed: ${errorMessage}`);
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPredictionResult(null);
    setError(null);
    setPatientData(null);
  };

  return (
    <div className="App">
      {/* Navigation Header */}
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>
            <FontAwesomeIcon icon={faHeartbeat} className="me-2" />
            {process.env.REACT_APP_APP_NAME}
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link>
              <FontAwesomeIcon icon={faChartLine} className="me-1" />
              {process.env.REACT_APP_MODEL_ACCURACY}% Accuracy
            </Nav.Link>
            <Nav.Link>
              <FontAwesomeIcon icon={faBrain} className="me-1" />
              AWS SageMaker
            </Nav.Link>
            <Nav.Link>
              <FontAwesomeIcon icon={faUserMd} className="me-1" />
              Clinical Grade AI
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container>
        {/* Header Section */}
        <Row className="mb-5 text-center">
          <Col>
            <h1 className="display-4 mb-3">
              <FontAwesomeIcon icon={faHeartbeat} className="text-primary me-3" />
              AI-Powered Diabetes Risk Assessment
            </h1>
            <p className="lead text-muted">
              Advanced machine learning system providing personalized diabetes risk evaluation
              with evidence-based health recommendations
            </p>
            <div className="badge-container mb-4">
              <span className="badge bg-success me-2 p-2">
                ✅ {process.env.REACT_APP_MODEL_ACCURACY}% Accuracy
              </span>
              <span className="badge bg-info me-2 p-2">🏥 Clinical Grade</span>
              <span className="badge bg-warning me-2 p-2">⚡ Real-time Results</span>
              <span className="badge bg-primary p-2">🔒 AWS SageMaker</span>
            </div>
            <div className="endpoint-info">
              <small className="text-muted">
                <strong>Endpoint:</strong> {process.env.REACT_APP_SAGEMAKER_ENDPOINT} | 
                <strong> Region:</strong> {process.env.REACT_APP_AWS_REGION} |
                <strong> Model:</strong> v{process.env.REACT_APP_MODEL_VERSION}
              </small>
            </div>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                <Alert.Heading>
                  <FontAwesomeIcon icon={faHeartbeat} className="me-2" />
                  Prediction Error
                </Alert.Heading>
                <p className="mb-0">{error}</p>
                <hr />
                <p className="mb-0 small">
                  Please check your input data and ensure the SageMaker endpoint is accessible.
                  If the problem persists, contact system administrator.
                </p>
              </Alert>
            </Col>
          </Row>
        )}

        {/* Main Content */}
        {loading ? (
          <LoadingSpinner />
        ) : predictionResult ? (
          <RiskResults 
            result={predictionResult} 
            patientData={patientData}
            onReset={handleReset}
          />
        ) : (
          <Row>
            <Col lg={8} className="mx-auto">
              <div className="card shadow-lg">
                <div className="card-header bg-primary text-white">
                  <h3 className="mb-0">
                    <FontAwesomeIcon icon={faUserMd} className="me-2" />
                    Patient Health Assessment
                  </h3>
                  <small className="opacity-75">
                    Enter patient information for AI-powered diabetes risk analysis
                  </small>
                </div>
                <div className="card-body">
                  <PatientForm onSubmit={handlePrediction} />
                </div>
              </div>
            </Col>
          </Row>
        )}

        {/* Information Section */}
        <Row className="mt-5">
          <Col md={4} className="mb-4">
            <div className="feature-card text-center p-4">
              <FontAwesomeIcon icon={faChartLine} size="3x" className="text-primary mb-3" />
              <h4>Advanced Analytics</h4>
              <p className="text-muted">
                Logistic Regression model trained on comprehensive health datasets
                with validated {process.env.REACT_APP_MODEL_ACCURACY}% accuracy rate
              </p>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="feature-card text-center p-4">
              <FontAwesomeIcon icon={faHeartbeat} size="3x" className="text-success mb-3" />
              <h4>Personalized Care</h4>
              <p className="text-muted">
                Tailored diet, exercise, and monitoring recommendations
                based on individual risk profiles and clinical guidelines
              </p>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="feature-card text-center p-4">
              <FontAwesomeIcon icon={faUserMd} size="3x" className="text-info mb-3" />
              <h4>Clinical Integration</h4>
              <p className="text-muted">
                Enterprise-grade AWS SageMaker infrastructure
                ready for healthcare system integration
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4 mt-5">
        <Container>
          <p className="mb-0">
            © 2025 {process.env.REACT_APP_APP_NAME} | 
            Powered by AWS SageMaker | 
            {process.env.REACT_APP_MODEL_ACCURACY}% Clinical Accuracy |
            Endpoint: {process.env.REACT_APP_SAGEMAKER_ENDPOINT}
          </p>
        </Container>
      </footer>
    </div>
  );
}

export default App;
