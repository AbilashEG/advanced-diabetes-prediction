import React, { useState } from 'react';
import { Card, Tab, Tabs, ListGroup, Badge, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUtensils, 
  faDumbbell, 
  faLifeRing, 
  faStethoscope,
  faHeartbeat,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';

function Recommendations({ recommendations, riskLevel, probability }) {
  const [activeTab, setActiveTab] = useState('diet');

  const getTabIcon = (category) => {
    switch (category) {
      case 'diet': return faUtensils;
      case 'exercise': return faDumbbell;
      case 'lifestyle': return faLifeRing;
      case 'monitoring': return faStethoscope;
      default: return faHeartbeat;
    }
  };

  const getTabColor = (category) => {
    switch (category) {
      case 'diet': return 'success';
      case 'exercise': return 'primary';
      case 'lifestyle': return 'info';
      case 'monitoring': return 'warning';
      default: return 'secondary';
    }
  };

  const getCategoryTitle = (category) => {
    switch (category) {
      case 'diet': return 'Nutritional Guidance';
      case 'exercise': return 'Physical Activity Plan';
      case 'lifestyle': return 'Lifestyle Modifications';
      case 'monitoring': return 'Health Monitoring Schedule';
      default: return category;
    }
  };

  const getCategoryDescription = (category) => {
    switch (category) {
      case 'diet': 
        return 'Evidence-based nutritional strategies to support glucose control and metabolic health.';
      case 'exercise': 
        return 'Structured physical activity recommendations for diabetes prevention and cardiovascular health.';
      case 'lifestyle': 
        return 'Comprehensive lifestyle modifications to reduce diabetes risk and improve overall well-being.';
      case 'monitoring': 
        return 'Clinical monitoring schedule and key health metrics to track prevention progress.';
      default: 
        return 'Personalized recommendations based on your risk assessment.';
    }
  };

  const getPriorityLevel = (category, riskLevel) => {
    const priorityMap = {
      'High Risk': {
        'monitoring': 'High',
        'diet': 'High', 
        'exercise': 'Medium',
        'lifestyle': 'Medium'
      },
      'Moderate Risk': {
        'diet': 'High',
        'exercise': 'High',
        'monitoring': 'Medium',
        'lifestyle': 'Medium'
      },
      'Low Risk': {
        'lifestyle': 'High',
        'exercise': 'Medium',
        'diet': 'Medium',
        'monitoring': 'Low'
      }
    };
    
    return priorityMap[riskLevel]?.[category] || 'Medium';
  };

  const renderRecommendationList = (items, category) => {
    if (!items || items.length === 0) {
      return (
        <div className="text-center text-muted py-4">
          <FontAwesomeIcon icon={getTabIcon(category)} size="2x" className="mb-3 opacity-50" />
          <p>No specific recommendations available for this category.</p>
        </div>
      );
    }

    const priority = getPriorityLevel(category, riskLevel);
    const priorityColor = priority === 'High' ? 'danger' : priority === 'Medium' ? 'warning' : 'success';

    return (
      <>
        <div className="mb-3">
          <Badge bg={priorityColor} className="mb-2">
            {priority} Priority
          </Badge>
          <p className="text-muted mb-0">
            {getCategoryDescription(category)}
          </p>
        </div>
        
        <ListGroup variant="flush">
          {items.map((item, index) => (
            <ListGroup.Item 
              key={index} 
              className="border-0 px-0 py-3 recommendation-item"
              style={{ borderLeft: `4px solid var(--bs-${getTabColor(category)})` }}
            >
              <div className="d-flex align-items-start">
                <div className={`badge bg-${getTabColor(category)} me-3 mt-1 recommendation-number`}>
                  {index + 1}
                </div>
                <div className="flex-grow-1">
                  <p className="mb-0 recommendation-text">{item}</p>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </>
    );
  };

  return (
    <Card className="recommendations-card shadow-lg">
      <Card.Header className="bg-gradient-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1">
              <FontAwesomeIcon icon={faHeartbeat} className="me-2" />
              Personalized Health Recommendations
            </h4>
            <small className="opacity-75">
              Evidence-based guidance tailored for {riskLevel.toLowerCase()} patients
              ({(probability * 100).toFixed(1)}% diabetes probability)
            </small>
          </div>
          <Badge bg="light" text="dark" className="fs-6">
            <FontAwesomeIcon icon={faChartLine} className="me-1" />
            AI-Generated
          </Badge>
        </div>
      </Card.Header>
      
      <Card.Body className="p-0">
        {/* Risk-specific Alert */}
        {riskLevel === 'High Risk' && (
          <Alert variant="danger" className="m-3 mb-0">
            <Alert.Heading className="h6">
              <FontAwesomeIcon icon={faStethoscope} className="me-2" />
              High Priority Interventions Required
            </Alert.Heading>
            <p className="mb-0 small">
              Your risk assessment indicates immediate need for lifestyle interventions and medical consultation. 
              Please prioritize the monitoring and dietary recommendations below.
            </p>
          </Alert>
        )}

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="nav-pills-custom border-bottom"
        >
          {Object.entries(recommendations).map(([category, items]) => (
            <Tab
              key={category}
              eventKey={category}
              title={
                <span className="tab-title">
                  <FontAwesomeIcon icon={getTabIcon(category)} className="me-2" />
                  {getCategoryTitle(category)}
                  <Badge bg={getTabColor(category)} className="ms-2">
                    {items ? items.length : 0}
                  </Badge>
                  {getPriorityLevel(category, riskLevel) === 'High' && (
                    <Badge bg="danger" className="ms-1">
                      !
                    </Badge>
                  )}
                </span>
              }
            >
              <div className="p-4">
                <div className="mb-4">
                  <h5 className={`text-${getTabColor(category)} mb-2`}>
                    <FontAwesomeIcon icon={getTabIcon(category)} className="me-2" />
                    {getCategoryTitle(category)}
                  </h5>
                </div>
                {renderRecommendationList(items, category)}
              </div>
            </Tab>
          ))}
        </Tabs>
      </Card.Body>
      
      <Card.Footer className="bg-light text-center">
        <div className="row">
          <div className="col-md-6">
            <small className="text-muted">
              <FontAwesomeIcon icon={faStethoscope} className="me-1" />
              <strong>Clinical Validation:</strong> Recommendations based on ADA and WHO guidelines
            </small>
          </div>
          <div className="col-md-6">
            <small className="text-muted">
              <FontAwesomeIcon icon={faChartLine} className="me-1" />
              <strong>AI Model:</strong> {process.env.REACT_APP_MODEL_ACCURACY}% accuracy on clinical datasets
            </small>
          </div>
        </div>
        <div className="mt-2">
          <small className="text-muted">
            Always consult healthcare professionals before implementing significant lifestyle changes.
          </small>
        </div>
      </Card.Footer>
    </Card>
  );
}

export default Recommendations;
