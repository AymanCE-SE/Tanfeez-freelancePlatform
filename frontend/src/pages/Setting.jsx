/** @format */

import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Nav,
  Tab,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { updatePassword } from "../api/auth";
import "../styles/components/Settings.css";

const Settings = () => {
  const { user } = useSelector((state) => state.authSlice);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Initialize account form
  const [accountForm, setAccountForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  });

  // Initialize notification settings with default values
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: false,
    messageNotifications: false,
    proposalNotifications: false,
    marketingEmails: false,
    ...user?.notificationSettings, // Spread user settings if they exist
  });

  // Initialize privacy settings with default values
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showContactInfo: false,
    showLastSeen: true,
    ...user?.privacySettings, // Spread user settings if they exist
  });

  // Handle account form changes
  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    setError(null);
  };

  // Handle password update
  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form values are not empty
    if (
      !accountForm.old_password ||
      !accountForm.new_password ||
      !accountForm.new_password_confirm
    ) {
      setError({ message: "All password fields are required" });
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (accountForm.new_password !== accountForm.new_password_confirm) {
      setError({ message: "New passwords do not match" });
      setLoading(false);
      return;
    }

    try {
      await updatePassword({
        old_password: accountForm.old_password,
        new_password: accountForm.new_password,
        new_password_confirm: accountForm.new_password_confirm, // Added this field
      });

      // Clear form after success
      setAccountForm({
        old_password: "",
        new_password: "",
        new_password_confirm: "",
      });
      setSuccessMessage("Password updated successfully!");
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState("account");

  // Handle notification settings changes
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle privacy settings changes
  const handlePrivacyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrivacySettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submissions with mock API calls
  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage("Notification settings updated successfully!");
    }, 1000);
  };

  const handlePrivacySubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage("Privacy settings updated successfully!");
    }, 1000);
  };

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <p>Please log in to access settings.</p>
      </Container>
    );
  }

  return (
    <div className="settings-page app-page-container">
      <Container className="py-5">
        <h2 className="settings-title">Account Settings</h2>

        {successMessage && (
          <Alert
            variant="success"
            className="mb-4"
            dismissible
            onClose={() => setSuccessMessage("")}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="mb-4">
            {error.message || "An error occurred. Please try again."}
          </Alert>
        )}

        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Row>
            <Col md={3} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                      <Nav.Link
                        eventKey="account"
                        className="rounded-0 border-bottom ">
                        Account
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link
                        eventKey="notifications"
                        className="rounded-0 border-bottom">
                        Notifications
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="privacy" className="rounded-0">
                        Privacy
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Card.Body>
              </Card>
            </Col>

            <Col md={9}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <Tab.Content>
                    {/* Account Settings Tab */}
                    <Tab.Pane eventKey="account">
                      <h4 className="mb-4">Account Settings</h4>
                      <Form onSubmit={handleAccountSubmit}>
                        <Form.Group className="mb-3" controlId="email">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={user.email}
                            disabled
                          />
                          <Form.Text className="text-muted">
                            Email address cannot be changed
                          </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="oldPassword">
                          <Form.Label>Current Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="old_password"
                            value={accountForm.old_password}
                            onChange={handleAccountChange}
                            placeholder="Enter your current password"
                            required
                          />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="newPassword">
                          <Form.Label>New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="new_password"
                            value={accountForm.new_password}
                            onChange={handleAccountChange}
                            placeholder="Enter your new password"
                            required
                          />
                        </Form.Group>

                        <Form.Group
                          className="mb-4"
                          controlId="confirmPassword">
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="new_password_confirm"
                            value={accountForm.new_password_confirm}
                            onChange={handleAccountChange}
                            placeholder="Confirm your new password"
                            isInvalid={
                              accountForm.new_password &&
                              accountForm.new_password !==
                                accountForm.new_password_confirm
                            }
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            Passwords do not match
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading}>
                          {loading ? "Updating..." : "Update Password"}
                        </Button>
                      </Form>
                    </Tab.Pane>

                    {/* Notifications Tab */}
                    <Tab.Pane eventKey="notifications">
                      <h4 className="mb-4">Notification Settings</h4>
                      <Form onSubmit={handleNotificationSubmit}>
                        <Form.Group
                          className="mb-3"
                          controlId="emailNotifications">
                          <Form.Check
                            type="switch"
                            label="Email Notifications"
                            name="emailNotifications"
                            checked={notificationSettings.emailNotifications}
                            onChange={handleNotificationChange}
                          />
                          <Form.Text className="text-muted">
                            Receive notifications via email
                          </Form.Text>
                        </Form.Group>

                        <Form.Group
                          className="mb-3"
                          controlId="messageNotifications">
                          <Form.Check
                            type="switch"
                            label="Message Notifications"
                            name="messageNotifications"
                            checked={notificationSettings.messageNotifications}
                            onChange={handleNotificationChange}
                          />
                          <Form.Text className="text-muted">
                            Receive notifications for new messages
                          </Form.Text>
                        </Form.Group>

                        <Form.Group
                          className="mb-3"
                          controlId="proposalNotifications">
                          <Form.Check
                            type="switch"
                            label="Proposal Notifications"
                            name="proposalNotifications"
                            checked={notificationSettings.proposalNotifications}
                            onChange={handleNotificationChange}
                          />
                          <Form.Text className="text-muted">
                            Receive notifications for new proposals
                          </Form.Text>
                        </Form.Group>

                        <Form.Group
                          className="mb-4"
                          controlId="marketingEmails">
                          <Form.Check
                            type="switch"
                            label="Marketing Emails"
                            name="marketingEmails"
                            checked={notificationSettings.marketingEmails}
                            onChange={handleNotificationChange}
                          />
                          <Form.Text className="text-muted">
                            Receive promotional emails and updates
                          </Form.Text>
                        </Form.Group>

                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading}>
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                      </Form>
                    </Tab.Pane>

                    {/* Privacy Tab */}
                    <Tab.Pane eventKey="privacy">
                      <h4 className="mb-4">Privacy Settings</h4>
                      <Form onSubmit={handlePrivacySubmit}>
                        <Form.Group
                          className="mb-3"
                          controlId="profileVisibility">
                          <Form.Label>Profile Visibility</Form.Label>
                          <Form.Select
                            name="profileVisibility"
                            value={privacySettings.profileVisibility}
                            onChange={handlePrivacyChange}>
                            <option value="public">
                              Public - Anyone can view your profile
                            </option>
                            <option value="registered">
                              Registered Users - Only registered users can view
                              your profile
                            </option>
                            <option value="private">
                              Private - Only you can view your profile
                            </option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group
                          className="mb-3"
                          controlId="showContactInfo">
                          <Form.Check
                            type="switch"
                            label="Show Contact Information"
                            name="showContactInfo"
                            checked={privacySettings.showContactInfo}
                            onChange={handlePrivacyChange}
                          />
                          <Form.Text className="text-muted">
                            Display your contact information on your profile
                          </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="showLastSeen">
                          <Form.Check
                            type="switch"
                            label="Show Last Seen Status"
                            name="showLastSeen"
                            checked={privacySettings.showLastSeen}
                            onChange={handlePrivacyChange}
                          />
                          <Form.Text className="text-muted">
                            Display when you were last active on the platform
                          </Form.Text>
                        </Form.Group>

                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading}>
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                      </Form>
                    </Tab.Pane>
                  </Tab.Content>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </div>
  );
};

export default Settings;
