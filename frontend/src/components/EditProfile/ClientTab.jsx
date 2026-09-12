import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getMyClientProfileAction, updateClientProfileAction } from "../../store/slices/userSlice";
import Swal from "sweetalert2";


const ClientTab = ({ navigate, id }) => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { client } = useSelector((myStore) => myStore.userSlice);

  useEffect(() => {
    if (!client) {
      dispatch(getMyClientProfileAction());
    }

  }, [client, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (client) {
      setFormData(client);
    }
  }, [client]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const filteredData = {
        company: formData.company,
      };
      await dispatch(updateClientProfileAction(filteredData)).unwrap().then(() => {
        Swal.fire({
          icon: "success",
          title: "Profile Updated",
          text: "Your profile has been updated successfully",
          timer: 3000,
          showConfirmButton: false,
        })
      }).catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Profile Not Updated",
          text: "Your profile has not been updated successfully",
          timer: 3000,
          showConfirmButton: false,
        });
      });

    } catch (err) {
      setError("Failed to update profile. Please try again.");
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h4 className="edit-profile-section-title">Company Information</h4>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Company Name</Form.Label>
            <Form.Control
              type="text"
              name="company"
              value={formData.company || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex gap-2 justify-content-end mt-4">
        <Button variant="outline-secondary" onClick={() => navigate(`/profile/${id}`)}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Save Changes
        </Button>
      </div>
    </Form>
  );
};

export default ClientTab;
