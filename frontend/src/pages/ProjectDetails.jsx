import { useParams } from "react-router-dom";
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
import {
  addProposalAction,
  approveProposalAction,
  finishProjectAction,
  getProposalsByProjectAction,
} from "../store/slices/proposalSlice";
import { getMyProposals, getPublicProposalsByProject } from "../api/proposal";
import Swal from "sweetalert2";
import RatingModal from "../components/rating/RatingModal";
import { getMyEngagementRating } from "../api/rating";

function ProjectDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposal, setProposal] = useState({
    body: "",
    bid_price: "",
    days_to_finish: "",
  });

  const [myProposal, setMyProposal] = useState(null);
  const [publicProposals, setPublicProposals] = useState([]);
  const [selectedProposalId, setSelectedProposalId] = useState(null);

  const { projectDetails, isLoading } = useSelector((myStore) => myStore.projectSlice);
  const { profile } = useSelector((myStore) => myStore.userSlice);
  const { user } = useSelector((myStore) => myStore.authSlice);
  const { proposals } = useSelector((myStore) => myStore.proposalSlice);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [myRating, setMyRating] = useState(null);
  const [ratingLoaded, setRatingLoaded] = useState(false);
  const isProjectOwner =
    String(user?.id) === String(projectDetails?.user_id) && projectDetails?.id === Number(id);

  const selectedProposal = proposals?.find((p) => p.id === selectedProposalId) || null;

  useEffect(() => {
    if (id && isProjectOwner) {
      dispatch(getProposalsByProjectAction(id));
    }
  }, [dispatch, id, isProjectOwner]);

  useEffect(() => {
    if (user?.user_type === "freelancer") {
      getMyProposals().then((res) => {
        const mine = res.data.find((p) => String(p.project) === String(id));
        setMyProposal(mine || null);
      }).catch(() => setMyProposal(null));
    }
  }, [user, id]);

  useEffect(() => {
    if (id) {
      getPublicProposalsByProject(id).then(setPublicProposals).catch(() => setPublicProposals([]));
    }
  }, [id]);

  useEffect(() => {
    dispatch(getProjectByIdAction(id)).unwrap()
      .then((project) => {
        if (project?.user_id) {
          dispatch(fetchUserProfile(project.user_id));
        }
      });
  }, [dispatch, id]);

  useEffect(() => {
  if (projectDetails?.progress === "completed" && projectDetails?.id === Number(id)) {
    setRatingLoaded(false);
    getMyEngagementRating({ project: id })
      .then(setMyRating)
      .catch(() => setMyRating(null))
      .finally(() => setRatingLoaded(true));
  }
}, [projectDetails?.progress, projectDetails?.id, id]);
  const isFreelancerOnProject = String(user?.id) === String(projectDetails?.freelancerId);
  const counterpartId = isProjectOwner ? projectDetails?.freelancerId : projectDetails?.user_id;
  const ratingDirection = isProjectOwner ? "client_to_freelancer" : "freelancer_to_client";
  const canRateProject =
    projectDetails?.progress === "completed" &&
    (isProjectOwner || isFreelancerOnProject) &&
    ratingLoaded &&
    !myRating &&
    counterpartId;

  const refreshProposalsData = () => {
    dispatch(getProjectByIdAction(id));
    getPublicProposalsByProject(id).then(setPublicProposals);
    if (isProjectOwner) {
      dispatch(getProposalsByProjectAction(id));
    }
  };

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
      setSelectedProposalId(null);
      refreshProposalsData();
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

  const handleFinishProject = async (proposalId) => {
    try {
      await dispatch(finishProjectAction(proposalId)).unwrap();
      setSelectedProposalId(null);
      refreshProposalsData();
      Swal.fire({
        icon: 'success',
        title: 'Project Completed',
        text: 'The project has been marked as completed.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: error?.message || 'Failed to finish the project. Please try again.',
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
      const res = await getMyProposals();
      const mine = res.data.find((p) => String(p.project) === String(id));
      setMyProposal(mine || null);      
      
      refreshProposalsData();
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
      <Card className="project-details-card">
        <Card.Body className="p-4">
          <div className="project-header">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h2 className="mb-0 project-details-title">
                {projectDetails?.name}
              </h2>
              <Badge
                bg={getStatusBadgeColor(projectDetails?.progress)}
                className="project-details-status-badge px-4 py-3 text-capitalize"
              >
                {projectDetails?.progress?.replace("_", " ")}
              </Badge>
            </div>
            <div className="d-flex flex-wrap gap-3 mt-3">
              <div className="project-details-meta-item">
                <Calendar3 size={18} className="me-1" />
                <span>
                  Posted{" "}
                  {projectDetails?.created_at
                    ? formatDistanceToNow(new Date(projectDetails.created_at), { addSuffix: true })
                    : "Unknown"}
                </span>
              </div>
              {projectDetails?.location && (
                <div className="project-details-meta-item">
                  <GeoAlt size={18} className="me-1" />
                  {projectDetails.location}
                </div>
              )}
              <div className="project-details-meta-item">
                <Cash size={18} className="me-1" />
                {getPrice()}
              </div>
              <div className="project-details-meta-item">
                <span className="ms-1">Duration: {projectDetails?.duration} days</span>
              </div>
            </div>
          </div>

          <section className="mb-5">
            <h5 className="project-details-section-title">Project Description</h5>
            <p className="project-details-description text-muted">{projectDetails?.description}</p>
          </section>

          {projectDetails?.skills && projectDetails.skills.length > 0 && (
            <section className="mb-4">
              <h6 className="project-details-section-title">Required Skills</h6>
              <div className="d-flex flex-wrap gap-2">
                {projectDetails.skills.map((skill, idx) => (
                  <Badge key={idx} className="skill-badge project-details-skill-badge py-2 px-3" bg="light" text="dark">
                    {skill.skill_name || skill}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <Row className="mb-5">
            <Col md={6}>
              <h5 className="project-details-section-title">Project Details</h5>
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
                <span className="client-stat-value">{projectDetails?.proposals_count ?? 0} proposals</span>
              </div>
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
              <h5 className="project-details-section-title">Client Information</h5>
              <Card className="client-profile-card">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    {profile?.photo ? (
                      <img
                        src={profile.photo}
                        alt="Client"
                        className="client-avatar project-details-avatar rounded-circle me-3"
                      />
                    ) : (
                      <div
                        className="client-avatar-placeholder project-details-avatar project-details-avatar-placeholder rounded-circle me-3 d-flex align-items-center justify-content-center"
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

                    {profile?.client_profile?.created_at && (
                      <div className="info-item">
                        <span className="info-label">Member Since:</span>
                        <span className="info-value">
                          {new Date(profile.client_profile.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {projectDetails?.progress === "not_started" && user?.user_type === "freelancer" && !myProposal && (
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
          {projectDetails?.progress === "completed" && (isProjectOwner || isFreelancerOnProject) && (
            <div className="mt-4 d-flex justify-content-end align-items-center gap-3">
              {canRateProject && (
                <Button variant="warning" onClick={() => setShowRatingModal(true)}>
                  Rate {isProjectOwner ? "Freelancer" : "Client"}
                </Button>
              )}
              {myRating && (
                <Button variant="outline-secondary" disabled>
                  Rated {myRating.rating}★
                </Button>
              )}
            </div>
          )}

            <RatingModal
            show={showRatingModal}
            onHide={() => setShowRatingModal(false)}
            direction={ratingDirection}
            ratee={counterpartId}
            project={id}
            onSuccess={() =>
              getMyEngagementRating({ project: id })
                .then(setMyRating)
                .catch(() => setMyRating(null))
            }
          />
        </Card.Body>
      </Card>

      {user?.user_type === "freelancer" && (
        <div className="proposals-section mt-4">
          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">Your Proposal</h5>
            </Card.Header>
            <Card.Body>
              {myProposal ? (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{myProposal.freelancer_name}</h6>
                    <div>
                      <Badge bg="primary" className="me-2">${myProposal.bid_price}</Badge>
                      <Badge bg="info">{myProposal.days_to_finish} days</Badge>
                      {myProposal.is_approved && <Badge bg="success" className="ms-2">Approved</Badge>}
                    </div>
                  </div>
                  <p className="mb-0 text-muted">
                    {myProposal.body?.slice(0, 120)}
                    {myProposal.body?.length > 120 ? "..." : ""}
                  </p>
                </div>
              ) : (
                <div className="text-center text-muted py-3">
                  You haven't submitted a proposal for this project yet.
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      )}

      {publicProposals.length > 0 && (
        <div className="proposals-section mt-4">
          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">Proposals ({publicProposals.length})</h5>
            </Card.Header>
            <Card.Body>
              {publicProposals.map((p) => (
                <div key={p.id} className="d-flex justify-content-between align-items-start py-2 border-bottom">
                  <div>
                    <h6 className="mb-1">{p.freelancer_name}</h6>
                    <p className="mb-0 text-muted small">{p.preview}</p>
                    <small className="text-muted">
                      {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                    </small>
                  </div>
                  {isProjectOwner && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="flex-shrink-0 ms-3"
                      onClick={() => setSelectedProposalId(p.id)}
                    >
                      View Details
                    </Button>
                  )}
                </div>
              ))}
            </Card.Body>
          </Card>
        </div>
      )}

      <Modal show={Boolean(selectedProposal)} onHide={() => setSelectedProposalId(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Proposal Details</Modal.Title>
        </Modal.Header>
        {selectedProposal && (
          <Modal.Body>
            <h6>{selectedProposal.freelancer_name}</h6>
            <div className="d-flex gap-2 mb-3">
              <Badge bg="primary">${selectedProposal.bid_price}</Badge>
              <Badge bg="info">{selectedProposal.days_to_finish} days</Badge>
              {selectedProposal.is_approved && <Badge bg="success">Approved</Badge>}
            </div>
            <p className="project-details-proposal-body">{selectedProposal.body}</p>

            {projectDetails?.progress === "not_started" && !selectedProposal.is_approved && (
              <Button variant="success" onClick={() => handleApproveProposal(selectedProposal.id)}>
                Accept Proposal
              </Button>
            )}
            {projectDetails?.progress === "in_progress" && selectedProposal.is_approved && (
              <Button variant="success" onClick={() => handleFinishProject(selectedProposal.id)}>
                Finish and Accept Project
              </Button>
            )}
          </Modal.Body>
        )}
      </Modal>

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