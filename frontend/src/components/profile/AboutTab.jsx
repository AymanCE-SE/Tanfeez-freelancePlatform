/** @format */

import React from "react";
import {
  Row,
  Col,
  Card,
  Badge,
} from "react-bootstrap";
import {
  PatchCheck,
} from "react-bootstrap-icons";
import "../../styles/components/AboutTab.css";
let profile = {};

const AboutTab = ({ profileData, isProfileOwner, userRole }) => {
  let role = profileData.user_type || userRole;


  if (role === "freelancer") {
    profile = profileData.freelancer_profile || {};
  } else if (role === "client") {
    profile = profileData.client_profile || {};
  } else if (role === "admin") {
    profile = { permissions: profileData.permissions || [] };
  }

  const {
    bio = "",
    skills = [],
    languages_list = [],
    // skills_list = skills_list.map(({ skill_name }) => skill_name),
    qualities_list = [],
    educations = [],
    certifications = [],
    company = "",
    permissions = [],
  } = profile;
  const renderFreelancerInfo = () => (
    <>
      <Card className="mb-4">
        <Card.Body>
          <h6 className="mt-4 mb-3">Skills</h6>
          <div className="d-flex flex-wrap gap-2">
          {skills.map(({ skill_name, id }) => (
            <Badge key={id} bg="light" text="dark">
              {skill_name}
            </Badge>
          ))}
          </div>

          <h6 className="mt-4 mb-3">Languages</h6>
          {languages_list.map((language, index) => (
          <div key={index} className="mb-2 text-muted">
            <span className="fw-medium">{language}</span>
          </div>
          ))}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Professional Qualities</h5>
          <Row xs={1} md={2} className="g-3 mb-4">
            {qualities_list.map((quality, index) => (
              <Col key={index}>
                <div className="quality-item">
                  <div className="d-flex align-items-center">
                    <PatchCheck className="text-primary me-2" size={20} />
                    <span>{quality}</span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-4">
  <Card.Body>
    <h5 className="mb-3">Education</h5>
    <Row xs={1} md={2} className="g-3">
      {educations.map((edu, index) => (
        <Col key={index}>
          <Card className="h-100 border-light shadow-sm">
            <Card.Body>
              <h6 className="fw-semibold">{edu.degree}</h6>
              <p className="mb-1 text-muted">{edu.school}</p>
              <small className="text-muted">{edu.year}</small>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </Card.Body>
</Card>

<Card className="mb-4">
  <Card.Body>
    <h5 className="mb-3">Certifications</h5>
    <Row xs={1} md={2} className="g-3">
      {certifications.map((cert, index) => (
        <Col key={index}>
          <Card className="h-100 border-light shadow-sm">
            <Card.Body>
              <h6 className="fw-semibold">{cert.name}</h6>
              <p className="mb-1 text-muted">{cert.issuer}</p>
              <small className="text-muted">{cert.year}</small>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </Card.Body>
</Card>

    </>
  );

  const renderRoleSpecificInfo = () => {
    switch (role) {
      case "freelancer":
        return renderFreelancerInfo();

      case "client":
        return (
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">Company Information</h5>
              <p>
                <strong>Company:</strong> {company}
              </p>
              <p>
                {/* <strong>Industry:</strong> {industry} */}
              </p>
            </Card.Body>
          </Card>
        );

      case "admin":
        return (
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">Administrative Access</h5>
              <div className="d-flex flex-wrap gap-2">
                {permissions.map((permission, index) => (
                  <Badge key={index} bg="info">
                    {permission.replace("_", " ").toUpperCase()}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="about-tab">
      {/* <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">About Me</h5>
          <p>{bio}</p>
        </Card.Body>
      </Card> */}

      {renderRoleSpecificInfo()}
    </div>
  );
};

export default AboutTab;
