/** @format */

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Tabs, Tab, Alert, Spinner } from "react-bootstrap";
import {
  Briefcase,
  PersonFill,
  Collection,
  Star,
  GeoAlt,
} from "react-bootstrap-icons";

// Import profile components
import {
  ProfileHeader,
  ServicesTab,
  PortfolioTab,
  AboutTab,
  ReviewsTab,
  ProjectsTab,
} from "../components/profile";
import { useSelector, useDispatch } from "react-redux";
import {
  clearProfile,
  fetchUserProfile,
  getMyProfileAction,
} from "../store/slices/userSlice";

const UserProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user, profile, isLoading, error } = useSelector(
    (state) => state.userSlice
  );

  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    dispatch(getMyProfileAction());
  }, [dispatch]);

  useEffect(() => {
    if (id && (!profile || String(profile.id) !== String(id))) {
      dispatch(fetchUserProfile(id));
    }
    // clear profile on unmount or id change to avoid stale data
    return () => {
      dispatch(clearProfile());
    };
  }, [id, dispatch]);

  // Show a spinner while loading
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading user profile...</p>
      </Container>
    );
  }

  // Only show "not found" if NOT loading and error is 404 or not found
  if (!isLoading && error && (error?.status === 404 || error?.data === "User profile not found")) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          User profile not found
        </Alert>
      </Container>
    );
  }

  // If profileData is still null (and not loading or not found), don't render tabs/UI
  if (!profile) {
    return null;
  }

  // Only use user to check if this is your own profile
  const isMyProfile = user && profile && String(user.id) === String(profile.id);
  const profileData = profile;

  const renderTabs = () => {
    const userRole = profileData?.user_type || "freelancer";

    const commonTabs = [
      {
        eventKey: "about",
        title: "About",
        icon: <PersonFill className="me-2" />,
        component: (
          <AboutTab profileData={profileData} isMyProfile={isMyProfile} />
        ),
      },
      {
        eventKey: "reviews",
        title: "Reviews",
        icon: <Star className="me-2" />,
        component: (
          <ReviewsTab
            reviews={profileData.reviews || []}
            isMyProfile={isMyProfile}
          />
        ),
      },
    ];

    const freelancerTabs = [
      {
        eventKey: "services",
        title: "Services",
        icon: <Briefcase className="me-2" />,
        component: (
          <ServicesTab
            services={profileData.services || []}
            isMyProfile={isMyProfile}
          />
        ),
      },

      ...commonTabs,
    ];

    const clientTabs = [
      {
        eventKey: "projects",
        title: "Projects",
        icon: <Briefcase className="me-2" />,
        component: <ProjectsTab isMyProfile={isMyProfile} />,
      },
      ...commonTabs,
    ];

    return userRole === "freelancer" ? freelancerTabs : clientTabs;
  };

  return (
    <div className="bg-light min-vh-100">
      <ProfileHeader profileData={profileData} isMyProfile={isMyProfile} />

      <Container className="mt-4">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4 custom-tab"
          justify>
          {renderTabs().map(({ eventKey, title, icon, component }) => (
            <Tab
              key={eventKey}
              eventKey={eventKey}
              title={
                <span className="d-flex align-items-center">
                  {icon}
                  {title}
                </span>
              }>
              {component}
            </Tab>
          ))}
        </Tabs>
      </Container>
      {!isLoading && error && (
        <Alert variant="danger" className="text-center">
          {typeof error === "string"
            ? error
            : error?.data?.detail || error?.data || error?.status || "An error occurred."}
        </Alert>
      )}
    </div>
  );
};

export default UserProfile;
