import React from "react";
import { Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../styles/components/ProjectMiniCard.css";

function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n - 1) + "…" : str;
}

const ProjectMiniCard = ({ project }) => {
  const {
    id,
    name,
    description,
    budget,
    created_at,
    experience_level,
    location,
    status,
  } = project;

  return (
    <Card className="project-mini-card shadow-sm border-0">
      <Card.Body className="p-2">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h6 className="mini-title mb-0">
            <Link to={`/projects/${id}`} className="mini-title-link">
              {truncate(name, 32)}
            </Link>
          </h6>
          <Badge bg={status === "open" ? "success" : "secondary"} className="mini-status-badge">
            {status}
          </Badge>
        </div>
        <div className="mini-meta mb-2">
          <Badge bg="info" className="me-1">{experience_level}</Badge>
          {location && <Badge bg="light" text="dark" className="me-1">{location}</Badge>}
        </div>
        <div className="mini-desc text-truncate text-muted mb-2" title={description}>
          {truncate(description, 48)}
        </div>
        <div className="mini-footer d-flex justify-content-between align-items-center">
          <span className="mini-price">{budget ? `$${budget}` : "N/A"}</span>
          <span className="mini-date">{created_at && new Date(created_at).toLocaleDateString()}</span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectMiniCard;