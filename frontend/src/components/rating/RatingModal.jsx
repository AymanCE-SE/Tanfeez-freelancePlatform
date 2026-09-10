import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { StarFill, Star } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { createEngagementRating } from "../../api/rating";

const RatingModal = ({ show, onHide, direction, ratee, project, service, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await createEngagementRating({
        direction,
        ratee,
        project: project || null,
        service: service || null,
        rating,
        review,
      });
      onSuccess?.();
      onHide();
      Swal.fire({ icon: "success", title: "Thanks for your feedback!", timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Couldn't submit rating",
        text: error?.response?.data?.[0] || error?.response?.data?.detail || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton><Modal.Title>Leave a Rating</Modal.Title></Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="d-flex justify-content-center gap-2 mb-3" style={{ fontSize: "2rem" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                role="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{ cursor: "pointer", color: (hoverRating || rating) >= star ? "#f5b301" : "#ddd" }}
              >
                {(hoverRating || rating) >= star ? <StarFill /> : <Star />}
              </span>
            ))}
          </div>
          <Form.Group>
            <Form.Label>Review (optional)</Form.Label>
            <Form.Control as="textarea" rows={3} value={review} onChange={(e) => setReview(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={submitting || rating === 0}>
            {submitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RatingModal;