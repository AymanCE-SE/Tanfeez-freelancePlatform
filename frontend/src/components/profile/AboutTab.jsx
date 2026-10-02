/** @format */

import React from "react";
import { Link } from "react-router-dom";
import { Card, Badge, Row, Col } from "react-bootstrap";
import { PatchCheck } from "react-bootstrap-icons";
import "../../styles/components/AboutTab.css";

const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== "";
const asList = (value) => Array.isArray(value) ? value : [];

const AboutTab = ({ profileData = {}, isProfileOwner, userRole }) => {
  const role = profileData.user_type || userRole;
  const profile = role === "freelancer"
    ? profileData.freelancer_profile || {}
    : role === "client"
      ? profileData.client_profile || {}
      : {};
  const bio = hasValue(profileData.bio) ? profileData.bio.trim() : "";
  const skills = asList(profile.skills).filter((skill) => hasValue(skill?.skill_name));
  const languages = asList(profile.languages_list).filter(hasValue);
  const qualities = asList(profile.qualities_list).filter(hasValue);
  const educations = asList(profile.educations).filter((item) =>
    [item.degree, item.school, item.year].some(hasValue)
  );
  const certifications = asList(profile.certifications).filter((item) =>
    [item.name, item.issuer, item.year].some(hasValue)
  );
  const company = hasValue(profile.company) ? profile.company.trim() : "";
  const permissions = asList(profileData.permissions).filter(hasValue);

  const hasRoleDetails = role === "freelancer"
    ? skills.length + languages.length + qualities.length + educations.length + certifications.length > 0
    : role === "client"
      ? Boolean(company)
      : role === "admin" && permissions.length > 0;

  if (!bio && !hasRoleDetails) {
    return (
      <Card className="about-tab-empty">
        <Card.Body>
          <p className="mb-2">No profile details have been added yet.</p>
          {isProfileOwner && (
            <Link to={`/profile/edit/${profileData.id}`}>Complete your profile</Link>
          )}
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="about-tab">
      {bio && (
        <Card>
          <Card.Body>
            <h5>About</h5>
            <p className="about-bio">{bio}</p>
          </Card.Body>
        </Card>
      )}

      {skills.length > 0 && (
        <Card>
          <Card.Body>
            <h5>Skills</h5>
            <div className="d-flex flex-wrap gap-2">
              {skills.map(({ skill_name, id }) => (
                <Badge key={id || skill_name} bg="light" text="dark">{skill_name}</Badge>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {languages.length > 0 && (
        <Card>
          <Card.Body>
            <h5>Languages</h5>
            <p className="about-inline-list">{languages.join(" · ")}</p>
          </Card.Body>
        </Card>
      )}

      {qualities.length > 0 && (
        <Card>
          <Card.Body>
            <h5>Professional qualities</h5>
            <Row xs={1} md={2} className="g-3">
              {qualities.map((quality, index) => (
                <Col key={`${quality}-${index}`}>
                  <div className="d-flex align-items-center gap-2">
                    <PatchCheck className="text-primary" size={20} aria-hidden="true" />
                    <span>{quality}</span>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {educations.length > 0 && (
        <Card>
          <Card.Body>
            <h5>Education</h5>
            <div className="about-record-list">
              {educations.map((item, index) => (
                <div className="about-record" key={`${item.degree || item.school}-${index}`}>
                  {hasValue(item.degree) && <h6>{item.degree}</h6>}
                  {hasValue(item.school) && <p>{item.school}</p>}
                  {hasValue(item.year) && <small>{item.year}</small>}
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {certifications.length > 0 && (
        <Card>
          <Card.Body>
            <h5>Certifications</h5>
            <div className="about-record-list">
              {certifications.map((item, index) => (
                <div className="about-record" key={`${item.name || item.issuer}-${index}`}>
                  {hasValue(item.name) && <h6>{item.name}</h6>}
                  {hasValue(item.issuer) && <p>{item.issuer}</p>}
                  {hasValue(item.year) && <small>{item.year}</small>}
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {company && (
        <Card>
          <Card.Body>
            <h5>Company</h5>
            <p className="about-inline-list">{company}</p>
          </Card.Body>
        </Card>
      )}

      {permissions.length > 0 && (
        <Card>
          <Card.Body>
            <h5>Administrative access</h5>
            <div className="d-flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <Badge key={permission} bg="info">
                  {permission.replaceAll("_", " ").toUpperCase()}
                </Badge>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default AboutTab;
