import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import Stack from 'react-bootstrap/Stack';
import { getEngagementRatings } from '../../api/rating';

function StarRating({ value }) {
  return (
    <span style={{ color: '#f8a800' }}>
      {'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}
    </span>
  );
}

export default function ReviewsSection({ freelancerId, serviceId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (freelancerId && serviceId) {
      getEngagementRatings(freelancerId, {
        direction: "client_to_freelancer",
        service: serviceId,
      }).then((data) => {
        const reviewList = Array.isArray(data) ? data : data?.results;
        setReviews(Array.isArray(reviewList) ? reviewList : []);
      }).catch(() => setReviews([]));
    }
  }, [freelancerId, serviceId]);

  if (reviews.length === 0) {
    return <p className="text-muted text-center py-3">No reviews yet for this service.</p>;
  }

  return (
    <Card className="p-4 shadow-sm border-0">
      <Stack gap={3}>
        {reviews.map((r) => (
          <div key={r.id} className="d-flex gap-3 align-items-start">
            {r.rater_photo ? (
              <Image src={r.rater_photo} roundedCircle width={40} height={40} alt={r.rater_name} />
            ) : (
              <div className="rounded-circle bg-secondary" style={{ width: 40, height: 40 }} />
            )}
            <div>
              <div className="fw-semibold text-muted" style={{ fontSize: '1.02rem' }}>
                {r.rater_name}
                <span className="ms-2"><StarRating value={r.rating} /></span>
                <span className="ms-2 text-secondary" style={{ fontSize: 12 }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              {r.review && <div className="text-secondary mt-1" style={{ fontSize: '0.98rem' }}>{r.review}</div>}
            </div>
          </div>
        ))}
      </Stack>
    </Card>
  );
}