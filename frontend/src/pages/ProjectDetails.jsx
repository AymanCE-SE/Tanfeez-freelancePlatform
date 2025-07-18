import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Modal,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  Calendar3,
  GeoAlt,
  Cash,
} from "react-bootstrap-icons";
import "../styles/pages/ProjectDetails.css";
import { useDispatch, useSelector } from "react-redux";
import { getProjectByIdAction } from "../store/slices/projectSlice";
import { fetchUserProfile } from "../store/slices/userSlice";
import { addProposalAction, approveProposalAction, getProposalsByProjectAction } from "../store/slices/proposalSlice";
import Swal from "sweetalert2";
import ProposalsList from "../components/proposals/ProposalsList";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposal, setProposal] = useState({
    body: "",
    bid_price: "",
    days_to_finish: "",
  });

  const { projectDetails, isLoading } = useSelector((myStore) => myStore.projectSlice);
  const { profile } = useSelector((myStore) => myStore.userSlice);
  const { user } = useSelector((myStore) => myStore.userSlice);
  const { proposals } = useSelector((myStore) => myStore.proposalSlice);

  useEffect(() => {
    if (id) {
      dispatch(getProposalsByProjectAction(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(getProjectByIdAction(id)).unwrap()
      .then((project) => {
        if (project?.user_id) {
          dispatch(fetchUserProfile(project.user_id));
        }
      });
  }, [dispatch, id]);

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!projectDetails) {
    return (
      <Alert variant="danger" className="my-5 text-center">
        Project not found.
      </Alert>
    );
  }

  const handleApproveProposal = async (proposalId) => {
    try {
      await dispatch(approveProposalAction(proposalId)).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Proposal Approved',
        text: 'The proposal has been approved successfully.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: error?.message || 'Failed to approve proposal. Please try again.',
      });
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    try {
      const proposalData = {
        ...proposal,
        project: id,
      };
      await dispatch(addProposalAction(proposalData)).unwrap();
      setShowProposalModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Proposal Submitted',
        text: 'Your proposal has been successfully submitted.',
        timer: 2000,
        showConfirmButton: false
      });
      setProposal({
        body: "",
        bid_price: "",
        days_to_finish: "",
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error?.message || 'Failed to submit proposal. Please try again.',
      });
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      open: "success",
      in_progress: "info",
      completed: "secondary",
      cancelled: "danger",
      not_started: "secondary",
    };
    return colors[status] || "primary";
  };

  const getPrice = () => {
    if (projectDetails.type === "hourly") {
      return projectDetails.hourly_rate != null
        ? `$${projectDetails.hourly_rate}/hr`
        : "Hourly rate not set";
    }
    return projectDetails.budget != null
      ? `$${projectDetails.budget}`
      : "Budget not set";
  };

  return (
    <Container className="mt-5 mb-5">
      <Card className="project-card">
        <Card.Body className="p-4">
          {/* Project Header */}
          <div className="project-header" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h2 className="mb-0 project-title" style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-text)" }}>
                {projectDetails?.name}
              </h2>
              <Badge
                bg={getStatusBadgeColor(projectDetails?.progress)}
                className="px-4 py-3 text-capitalize"
                style={{ fontSize: "1rem", fontWeight: 500 }}
              >
                {projectDetails?.progress?.replace("_", " ")}
              </Badge>
            </div>
            <div className="d-flex flex-wrap gap-3 mt-3">
              <div className="project-meta-item" style={{ display: "flex", alignItems: "center", color: "var(--color-text-muted)", fontSize: "1rem" }}>
                <Calendar3 size={18} className="me-1" />
                <span>
                  Posted{" "}
                  {projectDetails?.created_at
                    ? formatDistanceToNow(new Date(projectDetails.created_at), { addSuffix: true })
                    : "Unknown"}
                </span>
              </div>
              {projectDetails?.location && (
                <div className="project-meta-item" style={{ display: "flex", alignItems: "center", color: "var(--color-text-muted)", fontSize: "1rem" }}>
                  <GeoAlt size={18} className="me-1" />
                  {projectDetails.location}
                </div>
              )}
              <div className="project-meta-item" style={{ display: "flex", alignItems: "center", color: "var(--color-text-muted)", fontSize: "1rem" }}>
                <Cash size={18} className="me-1" />
                {getPrice()}
              </div>
              <div className="project-meta-item" style={{ display: "flex", alignItems: "center", color: "var(--color-text-muted)", fontSize: "1rem" }}>
                <span className="ms-1">Duration: {projectDetails?.duration} days</span>
              </div>
            </div>
          </div>

          {/* Project Description */}
          <section className="mb-5">
            <h5 className="section-title" style={{ fontWeight: 600, color: "var(--color-text)" }}>Project Description</h5>
            <p className="text-muted" style={{ fontSize: "1.1rem" }}>{projectDetails?.description}</p>
          </section>

          {/* Skills Section */}
          {projectDetails?.skills && projectDetails.skills.length > 0 && (
            <section className="mb-4">
              <h6 className="section-title" style={{ fontWeight: 600, color: "var(--color-text)" }}>Required Skills</h6>
              <div className="d-flex flex-wrap gap-2">
                {projectDetails.skills.map((skill, idx) => (
                  <Badge key={idx} className="skill-badge py-2 px-3" bg="light" text="dark" style={{ fontSize: "1rem", fontWeight: 500 }}>
                    {skill.skill_name || skill}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Project Details */}
          <Row className="mb-5">
            <Col md={6}>
              <h5 className="section-title" style={{ fontWeight: 600, color: "var(--color-text)" }}>Project Details</h5>
              <div className="client-stat">
                <span className="client-stat-label">Experience Level:</span>
                <span className="client-stat-value">{projectDetails?.experience_level}</span>
              </div>
              <div className="client-stat">
                <span className="client-stat-label">Project Type:</span>
                <span className="client-stat-value">{projectDetails?.type}</span>
              </div>
              <div className="client-stat">
                <span className="client-stat-label">Number of Proposals:</span>
                <span className="client-stat-value">{proposals?.length} proposals</span>
              </div>
              {/* Only show start/end date if available */}
              {projectDetails?.start_date && (
                <div className="client-stat">
                  <span className="client-stat-label">Start Date:</span>
                  <span className="client-stat-value">
                    {new Date(projectDetails.start_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {projectDetails?.end_date && (
                <div className="client-stat">
                  <span className="client-stat-label">End Date:</span>
                  <span className="client-stat-value">
                    {new Date(projectDetails.end_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </Col>

            <Col md={6}>
              <h5 className="section-title">Client Information</h5>
              <Card className="client-profile-card">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    {profile?.photo ? (
                      <img
                        src={profile.photo}
                        alt="Client"
                        className="client-avatar rounded-circle me-3"
                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="client-avatar-placeholder rounded-circle me-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: '60px',
                          height: '60px',
                          backgroundColor: '#e9ecef',
                          fontSize: '1.5rem'
                        }}
                      >
                        {profile?.first_name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h6 className="mb-0">{`${profile?.first_name} ${profile?.second_name}`}</h6>
                      <small className="text-muted">@{profile?.user_name}</small>
                    </div>
                  </div>

                  <div className="client-info-grid">
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{profile?.email}</span>
                    </div>

                    {profile?.phone && (
                      <div className="info-item">
                        <span className="info-label">Phone:</span>
                        <span className="info-value">{profile.phone}</span>
                      </div>
                    )}

                    {profile?.client_profile?.company && (
                      <div className="info-item">
                        <span className="info-label">Company:</span>
                        <span className="info-value">{profile.client_profile.company}</span>
                      </div>
                    )}

                    {profile?.bio && (
                      <div className="info-item">
                        <span className="info-label">Bio:</span>
                        <span className="info-value">{profile.bio}</span>
                      </div>
                    )}

                    <div className="info-item">
                      <span className="info-label">Member Since:</span>
                      <span className="info-value">
                        {new Date(profile?.client_profile?.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            {/* Comment out skills section since it's not in API */}
            {/* <Col md={6}>
              <h5 className="section-title">Required Skills</h5>
              <div className="d-flex flex-wrap gap-2">
                {projectDetails?.skills &&
                  projectDetails?.skills.map((skill, index) => (
                    <Badge key={index} className="skill-badge py-2 px-3">
                      {skill}
                    </Badge>
                  ))}
              </div>
            </Col> */}
          </Row>

          {  projectDetails?.progress === "not_started" &&   user.user_type === "freelancer" && (
            <div className="mt-4 d-flex justify-content-end">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowProposalModal(true)}
              >
                Submit Proposal
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {user.id === projectDetails?.user_id &&<ProposalsList 
        proposals={proposals}
        onApprove={handleApproveProposal}
        projectStatus = {projectDetails?.progress}
        isClientView={profile?.user_type === 'client' && projectDetails?.clientId === profile?.id}
      />}


      <Modal
        show={showProposalModal}
        onHide={() => setShowProposalModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Submit Proposal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitProposal}>
            <Form.Group className="mb-3">
              <Form.Label>Cover Letter</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={proposal.body}
                onChange={(e) =>
                  setProposal({ ...proposal, body: e.target.value })
                }
                placeholder="Explain why you're the best fit for this project..."
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Proposed Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    value={proposal.bid_price}
                    onChange={(e) =>
                      setProposal({ ...proposal, bid_price: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (days)</Form.Label>
                  <Form.Control
                    type="number"
                    value={proposal.days_to_finish}
                    onChange={(e) =>
                      setProposal({
                        ...proposal,
                        days_to_finish: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowProposalModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Proposal'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ProjectDetails;


