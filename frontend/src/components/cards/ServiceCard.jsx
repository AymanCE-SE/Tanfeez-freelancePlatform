import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import {  Clock, CheckCircle, StarFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import "../../styles/components/ServiceCard.css"; // Adjust the path as necessary
const ServiceCard = ({ service, isOwner }) => {
  const {
    id,
    service_name,
    description,
    price,
    rating = 5,
    reviewCount,
    deliveryTime,
    photo,
    status = "active",
    created_at, // <-- add this field
  } = service;

  return (
    <Card className="service-card h-100 border-0">
      <div className="service-card-image-wrapper">
        <Card.Img
          variant="top"
          src={photo}
          alt={service_name}
          className="service-image"
        />
        {status !== "active" && (
          <Badge 
            bg={status === "pending" ? "warning" : "danger"}
            className="status-badge"
          >
            {status}
          </Badge>
        )}
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="service-title mb-2">{service_name}</Card.Title>
        <Card.Text className="service-description mb-3">
          {description.length > 100
            ? `${description.substring(0, 100)}...`
            : description}
        </Card.Text>
        <div className="service-meta mb-3">
          <div className="rating">
            <StarFill className="star-icon me-1 text-warning bg" />
            <span className="rating-value">{rating}</span>
            <span className="review-count">({reviewCount})</span>
          </div>
          <div className="delivery-time">
            <Clock className="clock-icon" />
            <span>{deliveryTime}</span>
          </div>
        </div>
        {/* add service.tags  */}
        <div className="service-tags mb-3">
          {service.tags?.map((tag, index) => (
            <Badge key={index} className="tag-badge me-2">
              {tag}
            </Badge>
          ))}
        </div>
        {/* Posted date */}
        <div className="text-muted mb-2" style={{ fontSize: "0.95rem" }}>
          Posted {created_at ? formatDistanceToNow(new Date(created_at), { addSuffix: true }) : "Unknown"}
        </div>
        <div className="service-footer mt-auto">
          <div className="price">
            <span className="price-label">Starting at:</span>
            <span className="price-value">${price}</span>
          </div>
          {isOwner ? (
            <Button 
              variant="outline-primary" 
              as={Link}
              to={`/${id}/service`}
              className="service-action-btn"
            >
              Edit Service
            </Button>
          ) : (
            <Button 
              variant="primary" 
              as={Link}
              to={`/services/${id}`}
              className="service-action-btn"
            >
              View Details
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ServiceCard;