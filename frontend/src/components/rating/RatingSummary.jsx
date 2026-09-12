import React, { useEffect, useState } from "react";
import { StarFill } from "react-bootstrap-icons";
import { getEngagementRatingSummary } from "../../api/rating";

// direction: "client_to_freelancer" (rating a freelancer received as a
// freelancer) or "freelancer_to_client" (rating a client received)
const RatingSummary = ({ userId, direction, size = "sm" }) => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (userId) {
      getEngagementRatingSummary(userId, direction).then(setSummary);
    }
  }, [userId, direction]);

  if (!summary || summary.ratings_count === 0) {
    return <span className="text-muted small">No reviews yet</span>;
  }

  return (
    <span className={`d-inline-flex align-items-center gap-1 ${size === "lg" ? "fs-5" : ""}`}>
      <StarFill className="text-warning" />
      <strong>{summary.average_rating}</strong>
      <span className="text-muted">({summary.ratings_count})</span>
    </span>
  );
};

export default RatingSummary;