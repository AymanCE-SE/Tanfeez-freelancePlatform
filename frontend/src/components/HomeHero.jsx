import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/SearchComponent.css';

export function HomeHero() {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        const term = searchTerm.trim();
        navigate(term ? `/services?search=${encodeURIComponent(term)}` : '/services');
    };

    const handleTagClick = (tag) => {
        navigate(`/services?search=${encodeURIComponent(tag)}`);
    };

    const handleClear = () => {
        setSearchTerm('');
        navigate('/services');
    };

    return (
        <div className="search-component">
            <Container>
                <Row className="align-items-center justify-content-center" style={{ height: '60vh' }}>
                    <Col md={6} className="text-center">
                        <h1>What do you want to achieve today?</h1>
                        <p>Complete your tasks easily and securely with prices starting from just $5.</p>
                        <Form className="d-flex" onSubmit={handleSearch}>
                            <Form.Control
                                type="text"
                                placeholder="Search for a service"
                                className="me-2"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="success" type="submit">Search</Button>
                            {searchTerm && (
                                <Button
                                    variant="outline-secondary"
                                    className="ms-2"
                                    onClick={handleClear}
                                >
                                    Clear
                                </Button>
                            )}
                        </Form>
                        <div className="tags mt-4">
                            {['Marketing', 'WordPress', 'Design'].map((tag) => (
                                <span
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
