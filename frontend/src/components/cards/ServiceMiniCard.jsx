import React from "react";
import { Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../styles/components/ServiceMiniCard.css";

const ServiceMiniCard = ({ service }) => {
  const {
    id,
    service_name,
    price,
    photo,
    category,
    tags = [],
    created_at,
  } = service;

  return (
    <Card className="service-mini-card shadow-sm border-0">
      <Link to={`/services/${id}`}>
        <div className="mini-img-wrapper">
          <Card.Img src={photo} alt={service_name} className="mini-img" />
        </div>
      </Link>
      <Card.Body className="p-2">
        <h6 className="mini-title mb-1">
          <Link to={`/services/${id}`} className="mini-title-link">
            {service_name}
          </Link>
        </h6>
        <div className="mini-meta mb-2">
          <Badge bg="info" className="me-1">{category}</Badge>
          {tags.slice(0, 2).map((tag, idx) => (
            <Badge key={idx} bg="light" text="dark" className="me-1">{tag}</Badge>
          ))}
        </div>
        <div className="mini-footer d-flex justify-content-between align-items-center">
          <span className="mini-price">${price}</span>
          <span className="mini-date text-muted">{created_at && new Date(created_at).toLocaleDateString()}</span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ServiceMiniCard;