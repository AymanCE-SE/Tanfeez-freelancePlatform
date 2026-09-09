import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Badge, Row, Col } from "react-bootstrap";
import { BsPersonCircle, BsClock, BsChatDots } from "react-icons/bs";
import { formatDistanceToNow } from "date-fns";
import Swal from "sweetalert2";
import { getServiceProposalsByService, approveServiceProposal, completeServiceProposal } from "../api/serviceProposal";
import { getServiceByIdAction } from "../store/slices/serviceSlice";
import { useDispatch, useSelector } from "react-redux";
import "../styles/ServiceRequests.css";

const ServiceRequests = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { service } = useSelector((myStore) => myStore.serviceSlice);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingOnId, setActingOnId] = useState(null); // disables the button of whichever card is mid-action

  const loadRequests = () => {
    getServiceProposalsByService(serviceId)
      .then((res) => setRequests(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    dispatch(getServiceByIdAction(serviceId));
    loadRequests();
  }, [serviceId]);

  const handleAccept = async (requestId) => {
    setActingOnId(requestId);
    try {
      await approveServiceProposal(requestId);
      loadRequests();
      Swal.fire({ icon: "success", title: "Order Accepted", timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Failed", text: error?.response?.data?.detail || "Please try again." });
    } finally {
      setActingOnId(null);
    }
  };

  const handleComplete = async (requestId) => {
    setActingOnId(requestId);
    try {
      await completeServiceProposal(requestId);
      loadRequests();
      Swal.fire({ icon: "success", title: "Marked as Completed", timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Failed", text: error?.response?.data?.detail || "Please try again." });
    } finally {
      setActingOnId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="service-requests-page-container py-4" style={{ minHeight: "80vh" }}>
      {service && (
        <Card className="mb-4 shadow-sm service-card">
          <Card.Body>
            <h3 className="mb-2">{service.service_name}</h3>
            <div className="mb-2 text-muted">{service.description}</div>
            <div className="d-flex flex-wrap gap-2">
              <Badge bg="info">{service.category}</Badge>
              <Badge bg="dark">${service.price}</Badge>
            </div>
          </Card.Body>
        </Card>
      )}

      <h2 className="mb-4 section-title text-center">Orders</h2>

      {requests.length === 0 ? (
        <div className="text-center text-muted py-5">No orders yet.</div>
      ) : (
        <Row xs={1} md={2} lg={2} className="g-4">
          {requests.map((request) => (
            <Col key={request.id}>
              <Card className="request-card shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <BsPersonCircle size={38} className="me-3 text-primary" />
                    <div>
                      <div className="fw-bold">{request.client_name}</div>
                      <Badge bg={request.is_completed ? "secondary" : request.is_approved ? "success" : "warning"}>
                        {request.is_completed ? "Completed" : request.is_approved ? "Accepted" : "Pending"}
                      </Badge>
                    </div>
                  </div>

                  <Card.Text className="request-message mb-2">
                    <span className="text-muted">Message:</span>
                    <br />
                    {request.message || <span className="text-muted">No message</span>}
                  </Card.Text>

                  <div className="fw-semibold mb-3">Offer: ${request.price_offer}</div>

                  <div className="d-flex flex-wrap gap-3 mb-3 request-meta">
                    <span className="d-flex align-items-center">
                      <BsClock className="me-1 text-warning" />
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    {/* "Bargain" — negotiation happens through the chat that
                        was auto-created when the order was placed, not a
                        separate counter-offer field. */}
                    {request.chatroom_id && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="flex-fill"
                        onClick={() => navigate(`/chat/${request.chatroom_id}`)}
                      >
                        <BsChatDots className="me-1" /> Message & Bargain
                      </Button>
                    )}

                    {!request.is_approved && (
                      <Button
                        onClick={() => handleAccept(request.id)}
                        variant="success"
                        size="sm"
                        className="flex-fill"
                        disabled={actingOnId === request.id}
                      >
                        Accept
                      </Button>
                    )}

                    {request.is_approved && !request.is_completed && (
                      <Button
                        onClick={() => handleComplete(request.id)}
                        variant="primary"
                        size="sm"
                        className="flex-fill"
                        disabled={actingOnId === request.id}
                      >
                        Mark Completed
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ServiceRequests;