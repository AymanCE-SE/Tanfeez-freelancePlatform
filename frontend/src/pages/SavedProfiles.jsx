import React, { useEffect, useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { HeartFill, PersonFill, Trash } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getSavedProfiles, removeSavedProfile } from "../utils/savedProfiles";
import "../styles/pages/SavedProfiles.css";

const SavedProfiles = () => {
  const { user } = useSelector((state) => state.authSlice);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    setProfiles(getSavedProfiles(user?.id));
  }, [user?.id]);

  const handleRemove = (profileId) => {
    setProfiles(removeSavedProfile(user?.id, profileId));
  };

  return (
    <Container className="saved-profiles-page py-5">
      <div className="saved-profiles-heading mb-4">
        <div>
          <p className="saved-profiles-eyebrow mb-2">Your shortlist</p>
          <h1 className="mb-2">Saved accounts</h1>
          <p className="text-muted mb-0">Keep trusted clients and freelancers close at hand.</p>
        </div>
        <div className="saved-profiles-count">
          <HeartFill /> {profiles.length}
        </div>
      </div>

      {profiles.length === 0 ? (
        <Card className="saved-empty-card border-0">
          <Card.Body className="text-center py-5">
            <HeartFill size={32} className="text-danger mb-3" />
            <h4>No saved accounts yet</h4>
            <p className="text-muted mb-4">Save a profile to build your own shortlist.</p>
            <Button as={Link} to="/services" variant="primary">Explore services</Button>
          </Card.Body>
        </Card>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {profiles.map((profile) => (
            <Col key={profile.id}>
              <Card className="saved-profile-card h-100 border-0">
                <Card.Body className="d-flex flex-column p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    {profile.photo ? (
                      <img className="saved-profile-avatar" src={profile.photo} alt="" />
                    ) : (
                      <div className="saved-profile-avatar-placeholder"><PersonFill /></div>
                    )}
                    <div>
                      <h5 className="mb-1">{profile.first_name} {profile.second_name}</h5>
                      <span className="text-muted text-capitalize">{profile.user_type}</span>
                    </div>
                  </div>
                  <p className="text-muted saved-profile-bio flex-grow-1">
                    {profile.bio || "No profile bio available."}
                  </p>
                  <div className="d-flex gap-2 mt-3">
                    <Button as={Link} to={`/profile/${profile.id}`} variant="primary" className="flex-grow-1">
                      View profile
                    </Button>
                    <Button
                      variant="outline-danger"
                      aria-label={`Remove ${profile.first_name} from saved accounts`}
                      onClick={() => handleRemove(profile.id)}
                    >
                      <Trash />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default SavedProfiles;
