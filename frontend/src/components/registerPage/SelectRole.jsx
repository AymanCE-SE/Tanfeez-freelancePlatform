import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

export default function SelectRole({ setRole }) {
    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">Select Your Role</h2>
            <Row className="justify-content-center">
                {/* Client Card */}
                <Col md={5} className="mb-3">
                    <Card
                        className="text-center shadow-sm role-card"
                        onClick={() => setRole('client')} // Save the selected role
                    >
                        <Card.Body>
                            <Card.Title className="fs-4 fw-bold">I'm a Client</Card.Title>
                            <Card.Text>
                                I’m looking to hire talented freelancers for my projects.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Freelancer Card */}
                <Col md={5} className="mb-3">
                    <Card
                        className="text-center shadow-sm role-card"
                        onClick={() => setRole('freelancer')} // Save the selected role
                    >
                        <Card.Body>
                            <Card.Title className="fs-4 fw-bold">I'm a Freelancer</Card.Title>
                            <Card.Text>
                                I’m looking for work and want to showcase my skills.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
