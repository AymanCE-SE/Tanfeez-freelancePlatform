import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Badge, Alert } from "react-bootstrap";
import { FiTag, FiYoutube } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
// import { servicesData } from "../mock/servicesData";
import ImageGallery from "../components/serviceDetails/ImageGallery";
import ServiceDetails from "../components/serviceDetails/ServiceDetails";
import SellerInfo from "../components/serviceDetails/SellerInfo";
import PricingBox from "../components/serviceDetails/PricingBox";
// import FAQSection from "../components/serviceDetails/FAQSection";
import ReviewsSection from "../components/serviceDetails/ReviewsSection";
import "../styles/ServiceDetailsPage.css";
import { useDispatch, useSelector } from "react-redux";
import { getServiceByIdAction } from "../store/slices/serviceSlice";
import { fetchUserProfile } from "../store/slices/userSlice";

export function ServiceDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { service, isLoading } = useSelector((myStore) => myStore.serviceSlice);
  const { profile } = useSelector((myStore) => myStore.userSlice);

  useEffect(() => {
    dispatch(getServiceByIdAction(id))
      .unwrap()
      .then((response) => {
        const freelancerId = response.freelancerId;
        dispatch(fetchUserProfile(freelancerId));
      })
      .catch((error) => {
        console.error("Failed to fetch service:", error);
      });
  }, [id, dispatch]);

  if (!service) {
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
    <div className="service-details-page">
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
              <div className="custom-card mb-4">
                <div className="card-body-custom">
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
                      <Badge key={index} className="tag-badge me-2">
                        <FiTag className="me-1" /> {tag}
                      </Badge>
                    ))}
                  </div>

                  <ServiceDetails serviceData={service} />
                </div>
              </div>

              {/* YouTube Preview */}
              {youtubeVideoId && (
                <div className="custom-card mb-4">
                  <div className="card-header-custom">
                    <h5 className="mb-0 text-light">
                      <FiYoutube className="me-2 text-danger " /> Service Preview
                    </h5>
                  </div>
                  <div className="card-body-custom">
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
              <div className="custom-card mb-4">
                <div className="card-header-custom">
                  <h5 className="mb-0 text-light">About the Seller</h5>
                </div>
                <div className="card-body-custom">
                  <SellerInfo freelancer={service.freelancerId} />
                </div>
              </div>

              {/* FAQ Section */}
              {/* <div className="custom-card mb-4">
                <div className="card-header-custom">
                  <h5 className="mb-0">FAQ</h5>
                </div>
                <div className="card-body-custom">
                  <FAQSection />
                </div>
              </div> */}

              {/* Reviews Section */}
              <div className="custom-card">
                <div className="card-header-custom">
                  <h5 className="mb-0 text-light">Reviews</h5>
                </div>
                <div className="card-body-custom">
                  <ReviewsSection />
                </div>
              </div>
            </Col>

            {/* Right Column */}
            <Col lg={4}>
              <div className="sticky-sidebar">
                <PricingBox
                  price={service.price}
                  // deliveryTime={serviceData.deliveryTime}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </Container>
    </div>
  );
}