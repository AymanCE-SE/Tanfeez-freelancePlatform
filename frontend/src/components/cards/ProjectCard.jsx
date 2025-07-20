/** @format */

import React from "react";
import { Card, Badge, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
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
              className="project-title mb-0"
              style={{
                fontSize: "1.2rem",
                fontWeight: 600,
                maxWidth: "70%",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={name}
            >
              {truncate(name, 40)}
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
            className="project-description mb-3"
            style={{
              minHeight: "2.5em",
              maxHeight: "3.2em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              cursor: "pointer",
            }}
            title={description}
          >
            {truncate(description, 100)}
          </Card.Text>
        </OverlayTrigger>

        <div className="mb-3">
          <Badge bg="info" className="me-2 text-capitalize">{type}</Badge>
          <Badge bg="secondary" className="me-2 text-capitalize">{experience_level}</Badge>
          {location && (
            <Badge bg="light" text="dark" className="me-2">{location}</Badge>
          )}
        </div>

        <div className="mb-2 d-flex align-items-center">
          <Cash className="me-2" />
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
          <small className="text-muted">Duration: {duration} days</small>
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
            style={{ fontWeight: 500 }}
          >
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectCard;
