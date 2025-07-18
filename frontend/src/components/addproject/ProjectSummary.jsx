/** @format */

import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ProjectSummary = ({ formData, handleSubmit, isLoading }) => {
  const navigate = useNavigate();

  return (
    <div className="sticky-sidebar">
      <Card className="custom-card">
        <Card.Body className="card-body-custom">
          <h6 className="mb-3">Project Summary</h6>
          <div className="summary-item">
  <small className="text-muted">Type:</small>
  <span>{formData.type || "Not specified"}</span>
</div>
<div className="summary-item">
  <small className="text-muted">Budget:</small>
  <span>
    {formData.type === "Fixed Price"
      ? `$${formData.budget || "0"}`
      : `$${formData.hourlyRate || "0"}/hr`}
  </span>
</div>
<div className="summary-item">
  <small className="text-muted">Timeline:</small>
  <span>
    {formData.duration
      ? `${formData.duration} days`
      : "Not specified"}
  </span>
</div>
<div className="summary-item">
  <small className="text-muted">Experience Level:</small>
  <span>{formData.experience_level || "Not specified"}</span>
</div>
<div className="summary-item">
  <small className="text-muted">Location:</small>
  <span>{formData.location || "Not specified"}</span>
</div>
<div className="summary-item">
  <small className="text-muted">Skills:</small>
  <span>
    {formData.skills && formData.skills.length > 0
      ? formData.skills.map((skill, idx) => (
          <span key={idx} className="badge bg-primary me-1">
            {skill}
          </span>
        ))
      : "Not specified"}
  </span>
</div>
          <hr />
          <div className="d-grid gap-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                handleSubmit();
                if (!isLoading) navigate('/projects');
              }}
              className="submit-button"
              disabled={isLoading}>
              {isLoading ? "Posting..." : "Post Project"}
            </Button>
            <Button
              variant="outline-secondary"
              size="lg"
              onClick={() => navigate(-1)}
              className="cancel-button">
              Cancel
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProjectSummary;