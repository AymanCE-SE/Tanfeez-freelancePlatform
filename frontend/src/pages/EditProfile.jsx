/** @format */

import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Alert,
  Container,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditProfile.css";

import UserTab from "../components/EditProfile/UserTab";
import FreelancerTab from "../components/EditProfile/FreelancerTab";
import ClientTab from "../components/EditProfile/ClientTab";
import { useSelector } from "react-redux";

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoading } = useSelector((myStore) => myStore.userSlice);



  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [key, setKey] = useState('user'); // default tab is "user"



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading profile...</p>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="danger">User profile not found</Alert>
      </Container>
    );
  }

  const userType = user.user_type;

  return (
    <Container className="py-5">
      <Card className="edit-profile-card app-card">
        <Card.Body className="p-4">
          <h3 className="mb-4 text-muted">Edit Profile</h3>

          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success">
              Profile updated successfully! Redirecting...
            </Alert>
          )}

          <Tabs
            id="profile-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3"
          >
            <Tab eventKey="user" title="Persenal Information">
              <UserTab
                formData={formData}
                handleChange={handleChange}
                navigate={navigate}
                id={id}
                userType={userType}
                setFormData={setFormData}
              />
            </Tab>

            {(userType === "freelancer" ) && (
              <Tab eventKey="freelancer" title="Professional Information">
                <FreelancerTab
                  formData={formData.freelancer_profile}
                  handleChange={handleChange}
                  navigate={navigate}
                  id={id}
                  setFormData={setFormData}
                />
              </Tab>
            )}

            {(userType === "client" ) && (
              <Tab eventKey="client" title="Company Information">
                <ClientTab
                  formData={formData}
                  handleChange={handleChange}
                  navigate={navigate}
                  id={id}
                  setFormData={setFormData}
                />
              </Tab>
            )}
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditProfile;
