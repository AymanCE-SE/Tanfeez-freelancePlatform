import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { StarFill, PersonCircle } from "react-bootstrap-icons";
import "../../styles/components/ReviewsTab.css";

const ReviewsTab = ({ reviews = [] }) => {
  const averageRating = reviews.length
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="reviews-tab">
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <Row className="align-items-center">
            <Col className="text-center text-md-start">
              <h2 className="mb-0 text-muted">{averageRating}</h2>
              <div className="d-flex align-items-center justify-content-center justify-content-md-start">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarFill key={star} className={`me-1 ${star <= averageRating ? "text-warning" : "text-muted"}`} />
                ))}
                <span className="ms-2 text-muted">({reviews.length} reviews)</span>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="reviews-list mb-4">
        {reviews.map((review) => (
          <Card key={review.id} className="border-0 shadow-sm mb-3">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                {review.photo ? (
                  <img src={review.photo} alt={review.author}
                    className="rounded-circle me-3" width="40" height="40"
                    style={{ objectFit: "cover" }} />
                ) : (
                  <PersonCircle size={40} className="text-secondary me-3" />
                )}
                <div>
                  <h6 className="mb-0 fw-semibold text-muted">{review.author}</h6>
                      <div className="d-flex align-items-center">
                    {[...Array(5)].map((_, index) => (
                      <StarFill key={index} className={`me-1 ${index < review.rating ? "text-warning" : "text-muted"}`} size={12} />
                    ))}
                    <small className="text-muted ms-2">{review.date}</small>
                  </div>
                </div>
              </div>
              {review.comment && <p className="mb-0">{review.comment}</p>}
            </Card.Body>
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4 text-center">
              <p className="mb-0 text-muted">No reviews yet. Reviews appear automatically after completed projects or services.</p>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReviewsTab;