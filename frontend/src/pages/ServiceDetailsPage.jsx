import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Badge, Alert } from "react-bootstrap";
import { FiTag, FiYoutube } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import ImageGallery from "../components/serviceDetails/ImageGallery";
import ServiceDetails from "../components/serviceDetails/ServiceDetails";
import SellerInfo from "../components/serviceDetails/SellerInfo";
import PricingBox from "../components/serviceDetails/PricingBox";
import ReviewsSection from "../components/serviceDetails/ReviewsSection";
import "../styles/ServiceDetailsPage.css";
import { useDispatch, useSelector } from "react-redux";
import { getServiceByIdAction } from "../store/slices/serviceSlice";
import { fetchUserProfile } from "../store/slices/userSlice";
import { getMyServiceProposals } from "../api/serviceProposal";
import { getMyEngagementRating } from "../api/rating";
import RatingModal from "../components/rating/RatingModal";


export function ServiceDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { service, isLoading } = useSelector((myStore) => myStore.serviceSlice);
  const { profile } = useSelector((myStore) => myStore.userSlice);
  const { user } = useSelector((myStore) => myStore.authSlice);
  const [alreadyOrdered, setAlreadyOrdered] = useState(false);
  const [myServiceProposal, setMyServiceProposal] = useState(null);
  const [myRating, setMyRating] = useState(null);
  const [ratingLoaded, setRatingLoaded] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const orderStatus = myServiceProposal
  ? myServiceProposal.is_completed
    ? "completed"
    : myServiceProposal.is_approved
    ? "approved"
    : "pending"
  : null;

  useEffect(() => {
    dispatch(getServiceByIdAction(id))
      .unwrap()
      .then((response) => {
        dispatch(fetchUserProfile(response.freelancerId));
      })
      .catch((error) => console.error("Failed to fetch service:", error));
  }, [id, dispatch]);

  useEffect(() => {
    if (user?.user_type === "client") {
      getMyServiceProposals().then((res) => {
        const mine = res.data.find((p) => String(p.service) === String(id));
        setAlreadyOrdered(Boolean(mine));
        setMyServiceProposal(mine || null);
      });
    }
  }, [user, id]);

  // Only relevant once THIS client's own order on this service is
  // actually completed — not just approved, and not anyone else's order.
  useEffect(() => {
    if (myServiceProposal?.is_completed && service?.freelancerId) {
      setRatingLoaded(false);
      getMyEngagementRating({ service: id, ratee: service.freelancerId })
        .then(setMyRating)
        .catch(() => setMyRating(null))
        .finally(() => setRatingLoaded(true));
    }
  }, [myServiceProposal?.is_completed, service?.freelancerId, id]);

  const canRateService =
    myServiceProposal?.is_completed && ratingLoaded && !myRating;

  if (!service && !isLoading) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Service not found</Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

function extractYoutubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

const youtubeVideoId = extractYoutubeId(service?.video);

  return (
    <div className="service-details-page service-details-root">
      <Container fluid className="p-0">
        {/* Main Image Gallery */}
        <ImageGallery
          mainImage={service.photo}
          galleryImages={service.gallery_images ? service.gallery_images.map(img => img.image) : []}
        />

        <Container className="py-4">
          <Row>
            {/* Left Column */}
            <Col lg={8}>
              {/* Service Info */}
              <div className="service-details-card mb-4">
                <div className="service-details-card-body">
                  <h1 className="service-title mb-4">{service.service_name}</h1>

                  {/* Posted date */}
                  <div className="text-muted mb-3" style={{ fontSize: "1rem" }}>
                    Posted {service.created_at ? formatDistanceToNow(new Date(service.created_at), { addSuffix: true }) : "Unknown"}
                  </div>

                  <div className="service-tags mb-4">
                    <Badge bg="info" className="category-badge me-2 p-2">
                      {service.category}
                    </Badge>
                    {service.tags?.map((tag, index) => (
                      <Badge key={index} className="service-details-tag me-2">
                        <FiTag className="me-1" /> {tag}
                      </Badge>
                    ))}
                  </div>

                  <ServiceDetails serviceData={service} />
                </div>
              </div>

              {/* YouTube Preview */}
              {youtubeVideoId && (
                <div className="service-details-card mb-4">
                  <div className="service-details-card-header">
                    <h5 className="mb-0 text-light">
                      <FiYoutube className="me-2 text-danger " /> Service Preview
                    </h5>
                  </div>
                  <div className="service-details-card-body">
                    <div className="youtube-container">
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                        title="Service Preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="youtube-iframe"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Seller Info */}
              <div className="service-details-card mb-4">
                <div className="service-details-card-header">
                  <h5 className="mb-0 text-light">About the Seller</h5>
                </div>
                <div className="service-details-card-body">
                <SellerInfo id={service.freelancerId} />
                </div>
              </div>

              {/* Reviews Section */}
              <div className="service-details-card">
                <div className="service-details-card-header">
                  <h5 className="mb-0 text-light">Reviews</h5>
                </div>
                <div className="service-details-card-body">
                  <ReviewsSection freelancerId={service.freelancerId} serviceId={service.id} />
                  </div>
              </div>
            </Col>

            {/* Right Column */}
            <Col lg={4}>
              <div className="sticky-sidebar">
              <PricingBox
                price={service.price}
                serviceId={service.id}
                isOwnService={user?.id === service.freelancerId}
                orderStatus={orderStatus}
                onOrderSuccess={() => {
                  setAlreadyOrdered(true);
                  getMyServiceProposals().then((res) => {
                    setMyServiceProposal(res.data.find((p) => String(p.service) === String(id)) || null);
                  });
                }}
              />
              {canRateService && (
                <button
                  className="btn btn-warning w-100 mt-3"
                  onClick={() => setShowRatingModal(true)}
                >
                  Rate Freelancer
                </button>
              )}
              {myRating && (
                <div className="text-center text-muted mt-3">
                  You rated this {myRating.rating}★
                </div>
              )}
              </div>
            </Col>
          </Row>
        </Container>
      </Container>

      <RatingModal
        show={showRatingModal}
        onHide={() => setShowRatingModal(false)}
        direction="client_to_freelancer"
        ratee={service?.freelancerId}
        service={id}
        onSuccess={() =>
          getMyEngagementRating({ service: id, ratee: service.freelancerId })
            .then(setMyRating)
            .catch(() => setMyRating(null))
        }
      />
    </div>
  );
}