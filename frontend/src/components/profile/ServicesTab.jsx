/** @format */

import React, { useEffect } from "react";
import { Row, Col, Button } from "react-bootstrap";
import ServiceCard from "../cards/ServiceCard";
import { Plus } from "react-bootstrap-icons";
import { useDispatch, useSelector } from "react-redux";
import { getMyServicesAction, getUserServicesAction, clearServices } from "../../store/slices/serviceSlice";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";  
const ServicesTab = ({ isMyProfile, userId }) => {
  const { myServices, services, isLoading, error } = useSelector((state) => state.serviceSlice);
  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    if (isMyProfile) {
      dispatch(getMyServicesAction());
    } else if (userId) {
      dispatch(getUserServicesAction(userId));
    }

    // Cleanup function
    return () => {
      if (!isMyProfile) {
        dispatch(clearServices());
      }
    };
  }, [id, isMyProfile, userId, dispatch]);

  const displayServices = isMyProfile ? myServices : services;

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="services-tab">
      {isMyProfile && (
        <div className="d-flex justify-content-end mb-4">
        <Button variant="primary" as={Link} to="/0/service">
          <Plus className="me-2" />
          Add New Service
        </Button>
        </div>
      )}

      <Row xs={1} md={2} lg={3} className="g-4">
        {displayServices?.map((service) => (
          <Col key={service.id}>
            <ServiceCard service={service} isOwner={isMyProfile} />
          </Col>
        ))}

        {(!displayServices || displayServices.length === 0) && (
          <Col xs={12}>
            <div className="text-center py-5">
              <h5 className="text-muted mb-3">No services available</h5>
              {isMyProfile && (
                <Button variant="primary">
                  <Plus className="me-2" />
                  Create Your First Service
                </Button>
              )}
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ServicesTab;