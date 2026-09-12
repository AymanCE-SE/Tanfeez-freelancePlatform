import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Badge, Row, Col } from "react-bootstrap";
import { BsPersonCircle, BsClock, BsCurrencyDollar } from "react-icons/bs";
import { mockProjects } from "../mock/projectsData";
import { mockProposals } from "../mock/mockProposals";
import "../styles/ProjectProposals.css";

const statusColors = {
  pending: "secondary",
  accepted: "success",
  rejected: "danger",
};

const ProjectProposals = () => {
  const { projectId } = useParams();
  const [proposals, setProposals] = useState([]);
  const [project, setProject] = useState(null);

  useEffect(() => {
    setProposals(mockProposals);
    const found = mockProjects.find(
      (p) => String(p.id) === String(projectId)
    );
    setProject(found);
  }, [projectId]);

  const handleStatus = (proposalId, status) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId ? { ...p, status } : p
      )
    );
  };

  if (!project) {
    return <div className="text-center text-muted py-5">Project not found.</div>;
  }

  return (
    <div className="proposals-page-container py-4" style={{ minHeight: "80vh" }}>
      {/* --- Project Main Info --- */}
      <Card className="mb-4 shadow-sm proposal-project-card">
        <Card.Body>
          <h3 className="mb-2">{project.title}</h3>
          <div className="mb-2 text-muted">{project.description}</div>
          <div className="d-flex flex-wrap gap-3 mb-2">
            <Badge bg="info" className="me-2">{project.type}</Badge>
            <Badge bg="secondary" className="me-2">{project.level}</Badge>
            <Badge bg="success" className="me-2">{project.status}</Badge>
            <Badge bg="dark" className="me-2">{project.budget}</Badge>
            <Badge bg="light" text="dark" className="me-2">{project.location}</Badge>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {project.skills && project.skills.map((skill, idx) => (
              <Badge key={idx} bg="primary" className="me-1">{skill}</Badge>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* --- Proposals List --- */}
      <h2 className="mb-4 proposal-section-title text-center">Project Proposals</h2>
      {proposals.length === 0 ? (
        <div className="text-center text-muted py-5">No proposals yet.</div>
      ) : (
        <Row xs={1} md={2} lg={2} className="g-4">
          {proposals.map((proposal) => (
            <Col key={proposal.id}>
              <Card className="proposal-card shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <BsPersonCircle size={38} className="me-3 text-primary" />
                    <div>
                      <div className="fw-bold">{proposal.freelancerName}</div>
                      <Badge
                        bg={statusColors[proposal.status]}
                        className="proposal-status-badge ms-1"
                      >
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <Card.Text className="proposal-cover-letter mb-3">
                    <span className="text-muted">Cover Letter:</span>
                    <br />
                    {proposal.coverLetter}
                  </Card.Text>
                  <div className="d-flex flex-wrap gap-3 mb-3 proposal-meta">
                    <span className="d-flex align-items-center">
                      <BsCurrencyDollar className="me-1 text-success" />
                      <span className="fw-semibold">{proposal.price}</span>
                    </span>
                    <span className="d-flex align-items-center">
                      <BsClock className="me-1 text-warning" />
                      <span>{proposal.deliveryTime} days</span>
                    </span>
                  </div>
                  {proposal.status === "pending" && (
                    <div className="d-flex gap-2 mt-2">
                      <Button
                        onClick={() => handleStatus(proposal.id, "accepted")}
                        variant="success"
                        size="sm"
                        className="flex-fill"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleStatus(proposal.id, "rejected")}
                        variant="danger"
                        size="sm"
                        className="flex-fill"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ProjectProposals;