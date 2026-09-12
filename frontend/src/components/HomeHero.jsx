import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, ShieldCheck, Stars } from 'react-bootstrap-icons';
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
        <section className="search-component">
            <Container>
                <div className="hero-grid">
                    <div className="hero-copy">
                        <div className="hero-kicker"><span /> Tanfeez freelance marketplace</div>
                        <h1>Bring your best work to <em>life.</em></h1>
                        <p className="hero-lede">Find the right freelancer for the job, or turn your expertise into your next opportunity.</p>
                        <Form className="hero-search" onSubmit={handleSearch}>
                            <Search className="hero-search-icon" aria-hidden="true" />
                            <Form.Control
                                type="text"
                                placeholder="Search services, skills, or tags"
                                aria-label="Search services, skills, or tags"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && <button type="button" className="hero-clear" onClick={handleClear}>Clear</button>}
                            <Button type="submit">Search <ArrowRight /></Button>
                        </Form>
                        <div className="hero-tags">
                            <span>Popular:</span>
                            {['Marketing', 'WordPress', 'Design'].map((tag) => (
                                <button key={tag} type="button" onClick={() => handleTagClick(tag)}><i />{tag}</button>
                            ))}
                        </div>
                        <div className="hero-proof">
                            <span><ShieldCheck /> Secure payments</span>
                            <span><Stars /> Vetted talent</span>
                        </div>
                        <div className="hero-metric-row">
                            <span><strong>10k+</strong> services</span>
                            <span><strong>4.9/5</strong> client rating</span>
                            <span><strong>24/7</strong> support</span>
                        </div>
                    </div>
                    <div className="hero-visual" aria-hidden="true">
                        <div className="hero-connection"><i /><i /></div>
                        <div className="hero-image-main" />
                        <div className="hero-floating-note hero-floating-note-top"><strong>4.9/5</strong><span>average rating</span></div>
                        <div className="hero-people-note"><span className="hero-avatar-stack"><i /><i /><i /></span><span><strong>Real people.</strong><br />Real progress.</span></div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
