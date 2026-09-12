/** @format */

import React from "react";
import { Card, Badge, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Cash } from "react-bootstrap-icons";
import { formatDistanceToNow } from "date-fns";

// Map progress to badge color
const progressColor = {
  not_started: "secondary",
  in_progress: "info",
  completed: "success",
  cancelled: "danger",
  open: "primary",
};

const truncate = (text, maxLength) =>
  text && text.length > maxLength ? text.slice(0, maxLength - 1) + "…" : text;

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const {
    id,
    name,
    description,
    budget,
    created_at,
    duration,
    status,
    client_id, // <-- use 'client_id' from API
    type,
    experience_level,
    location,
  } = project;

  const handleViewDetails = () => {
    navigate(`/project/${id}`);
  };

  return (
    <Card className="project-card h-100 border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{name}</Tooltip>}
          >
            <Card.Title
              className="project-title project-title-truncated mb-0"
              title={name}
            >
              <Link
                to={`/project/${id}`}
                className="text-decoration-none text-reset"
              >
                {truncate(name, 40)}
              </Link>
            </Card.Title>
          </OverlayTrigger>
          <Badge bg={progressColor[status] || "secondary"} className="text-capitalize">
            {status.replace("_", " ")}
          </Badge>
        </div>

        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>{description}</Tooltip>}
        >
          <Card.Text
            className="project-description project-description-truncated mb-3"
            title={description}
          >
            {truncate(description, 100)}
          </Card.Text>
        </OverlayTrigger>

        <div className="mb-3">
          <Badge bg="info" className="project-tag me-2 text-capitalize">{type}</Badge>
          <Badge bg="secondary" className="project-tag me-2 text-capitalize">{experience_level}</Badge>
          {location && (
            <Badge bg="light" text="dark" className="project-tag location-tag me-2">{location}</Badge>
          )}
        </div>

        <div className="project-budget mb-2 d-flex align-items-center">
          <Cash className="me-2" aria-hidden="true" />
        <span>
          {type === "hourly"
            ? (project.hourly_rate != null
                ? `$${project.hourly_rate}/hr`
                : "Hourly rate not set")
            : (project.budget != null
                ? `$${project.budget}`
                : "Budget not set")}
        </span>
        </div>
        <div className="mb-2">
          <small className="text-muted">Duration <strong>{duration} days</strong></small>
        </div>
        <div className="mb-3">
          <small className="text-muted">
            Posted:{" "}
            {created_at
              ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
              : "Unknown"}
          </small>
        </div>

        <div className="mt-auto pt-2">
          <Button
            variant="primary"
            onClick={handleViewDetails}
            className="w-100"
          >
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectCard;
