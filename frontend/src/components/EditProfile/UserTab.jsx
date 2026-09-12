import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { updateUserProfileAction } from "../../store/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { getCountries } from "../../api/countries";

const UserTab = ({ setFormData, formData, handleChange, navigate, id }) => {
    const dispatch = useDispatch();
    const { user, isLoading } = useSelector((myStore) => myStore.userSlice);
    const [countries, setCountries] = useState([]);
    const [countriesLoading, setCountriesLoading] = useState(true);
    const [countriesError, setCountriesError] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({ ...user, country: user.country || user.address || "" });
        }
    }, [user]);

    useEffect(() => {
        getCountries()
            .then(setCountries)
            .catch(() => setCountriesError(true))
            .finally(() => setCountriesLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const filteredData = { ...formData };
            delete filteredData.freelancer_profile;
            delete filteredData.client_profile;
            delete filteredData.photo;
            delete filteredData.id; // Exclude id
            filteredData.address = filteredData.country || "";
            delete filteredData.country;
            filteredData.birth_date = filteredData.birth_date || null;

            await dispatch(updateUserProfileAction(filteredData))
                .unwrap()
                .then(() => {
                    Swal.fire({
                        icon: "success",
                        title: "Profile Updated",
                        text: "Your profile has been updated successfully",
                        timer: 3000,
                        showConfirmButton: false,
                    })
                })
                .catch((err) => {
                    Swal.fire({
                        icon: "failure",
                        title: "Profile Not Updated",
                        text: "Your profile has not been updated successfully",
                        timer: 3000,
                        showConfirmButton: false,
                    });
                });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Profile Not Updated",
                text: "Failed to update profile. Please try again.",
                timer: 3000,
                showConfirmButton: false,
            });
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <h4 className="edit-profile-section-title">Basic Information</h4>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="first_name"
                            value={formData.first_name || ""}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Second Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="second_name"
                            value={formData.second_name || ""}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email || ""}
                            onChange={handleChange}
                            disabled
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            name="user_name"
                            value={formData.user_name || ""}
                            onChange={handleChange}
                            required
                            disabled
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="text"
                            name="phone"
                            value={formData.phone || ""}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Birth Date</Form.Label>
                        <Form.Control
                            type="date"
                            name="birth_date"
                            value={formData.birth_date || ""}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                            as="select"
                            name="country"
                            value={formData.country || ""}
                            onChange={handleChange}
                            disabled={countriesLoading || countriesError}
                        >
                            <option value="">
                                {countriesLoading ? "Loading countries..." : "Select your country"}
                            </option>
                            {countries.map((country) => (
                                <option key={country.code} value={country.name}>
                                    {country.name}
                                </option>
                            ))}
                        </Form.Control>
                        {countriesError && (
                            <Form.Text className="text-danger">
                                Countries could not be loaded. Please try again later.
                            </Form.Text>
                        )}
                    </Form.Group>
                </Col>
            </Row>
            <Form.Group className="mb-4">
                <Form.Label>Bio</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleChange}
                />
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end mt-4">
                <Button
                    variant="outline-secondary"
                    onClick={() => navigate(`/profile/${id}`)}>
                    Cancel
                </Button>
                <Button variant="primary" type="submit">
                    Save Changes
                </Button>
            </div>
        </Form>
    );
};

export default UserTab;
