/** @format */

import React, { use, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Image, Button, Row, Col, Badge } from "react-bootstrap";
import {
  Star,
  Award,
  Clock,
  Heart,
  Share,
  ChatDots,
  Pencil,
  GeoAlt,
  Envelope,
  Calendar3,
  PersonBadge,
  Camera,
} from "react-bootstrap-icons";
import "../../styles/UserProfile.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getMyProfileAction, updateUserImageAction } from "../../store/slices/userSlice";

const ProfileHeader = ({ profileData, isMyProfile }) => {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const dispatch = useDispatch();




  const handleAvatarClick = () => {
    if (isMyProfile) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        alert("Please upload a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      if (file.size > maxSize) {
        alert("File size should be less than 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Prepare form data for API
      const formData = new FormData();
      formData.append("photo", file);

      // Upload image and re-fetch profile
      await dispatch(updateUserImageAction(formData)).unwrap();
      dispatch(getMyProfileAction());
    }
  };

  if (!profileData) {
    return <div className="profile-header text-center py-5">Loading...</div>;
  }

  const {
    photo = "/avatar.png",
    first_name = "User",
    second_name = "User",
    user_type = "Freelancer",
    address = "Not specified",
    averageRating = 0,
    numberOfReviews = 0,
    completionRate = 0,
    averageResponse = "N/A",
    client_profile = null,
    freelancer_profile = null,
  } = profileData || {};

  // Safe destructuring with null checks
  const clientCreatedAt = client_profile?.created_at || "2025-01-01";
  const freelancerCreatedAt = freelancer_profile?.created_at || "2024-01-01";
  const stats = [
    {
      icon: Star,
      text: `${averageRating.toFixed(1)} (${numberOfReviews} reviews)`,
    },
    { icon: Award, text: `${completionRate}% Completion` },
    { icon: Clock, text: `${averageResponse} response` },
  ];

  const actions = [
    { icon: Heart, text: "Save", variant: "light" },
    { icon: Share, text: "Share", variant: "light" },
    { icon: Envelope, text: "Message", variant: "light" },
  ];

  const getRoleBadgeVariant = (user_type) => {
    switch (user_type.toLowerCase()) {
      case "freelancer":
        return "primary";
      case "client":
        return "success";
      case "none":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div className="profile-header text-center">
      <Container>
        <div className="profile-pic-container mb-4 position-relative">
          <Image
            src={photo == null ? '/avatar.png' : photo}
            roundedCircle
            className="profile-avatar"
            alt={`${first_name} ${second_name}`}
          />
          {isMyProfile && (
            <>
              <div
                className="avatar-upload-overlay"
                onClick={handleAvatarClick}>
                <Camera size={24} />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
                className="d-none"
              />
            </>
          )}
          <span className="profile-status-dot" />
        </div>

        <h2 className="fw-bold mb-1">
          {first_name} {second_name}
          <Badge
            bg={getRoleBadgeVariant(user_type)}
            className="ms-2 role-badge text-capitalize"
            size="sm"
            pill>
            <PersonBadge size={12} className="me-1" />
            {user_type === "none" ? "Admin" : user_type}
          </Badge>
        </h2>
        {  <div className="text-muted mb-3"> {profileData.bio }</div>}

        <div className="d-flex justify-content-center gap-3 mb-4">
          <span className="profile-badge">
            <GeoAlt size={18} className="me-2" />
            {address}
          </span>
          <span className="profile-badge">
            <Calendar3 size={18} className="me-2" />
            Member since {new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short" }).format(
              new Date(user_type.toLowerCase() === "client" ? clientCreatedAt : freelancerCreatedAt)
            )}
          </span>
        </div>

        <Row className="justify-content-center mb-4">
          <Col xs={12} md={8}>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              {stats.map(({ icon: Icon, text }, idx) => (
                <span key={idx} className="profile-badge">
                  <Icon size={18} className="me-2" />
                  {text}
                </span>
              ))}
            </div>
          </Col>
        </Row>

        <div className="d-flex flex-wrap justify-content-center gap-2">
          {actions.map(({ icon: Icon, text, variant }, idx) => (
            <Button key={idx} variant={variant} className="action-btn">
              <Icon size={18} className="me-2" />
              {text}
            </Button>
          ))}

          {isMyProfile ? (
            <Button
              as={Link}
              to={`/profile/edit/${profileData.id}`}
              variant="success"
              className="action-btn">
              <Pencil size={18} className="me-2" />
              Edit Profile
            </Button>
          ) : (
            <Button
              as={Link}
              to={`/chat?user=${profileData.id}`}
              variant="primary"
              className="action-btn">
              <ChatDots size={18} className="me-2" />
              Contact
            </Button>
          )}
        </div>
      </Container>
    </div>
  );
};

export default ProfileHeader;
