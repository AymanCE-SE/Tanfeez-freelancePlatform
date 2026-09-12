import React from 'react'
import '../styles/HomeCategory.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

import { 
  faStore, faMobileAlt, faVideo, faPalette,
  faHashtag, faLanguage, faSearch, faObjectGroup,
  faClock, faWallet, faLayerGroup, faUserTie,
  faLock, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

export function HomeCategory() {
  const services = [
    'Digital Marketing',
    'Design & Programming',
    'Video & Motion',
    'Digital Strategy',
    'Objectives',
    'Activity',
    'AI Solutions',
    'Innovative Methods'
  ];
  const popular = [
    { name: 'E-Commerce Website', icon: faStore },
    { name: 'Mobile App Development', icon: faMobileAlt },
    { name: 'Video Editing', icon: faVideo },
    { name: 'Logo Design', icon: faPalette },
    { name: 'Social Media Management', icon: faHashtag },
    { name: 'Translation Services', icon: faLanguage },
    { name: 'SEO Optimization', icon: faSearch },
    { name: 'Graphic Design', icon: faObjectGroup }
  ];
  const features = [
    { icon: faClock, title: '24/7 Availability', description: 'Round-the-clock service for your business needs' },
    { icon: faWallet, title: 'Affordable Pricing', description: 'High-quality services starting at just $5' },
    { icon: faLayerGroup, title: '350+ Categories', description: 'Supporting thousands of services across all fields' },
    { icon: faUserTie, title: 'Professional Providers', description: 'Verified experts delivering top-notch services' },
    { icon: faLock, title: 'Secure Transactions', description: 'Safe and reliable payment processing' },
    { icon: faShieldAlt, title: 'Rights Protection', description: 'Guaranteed financial rights and work delivery' }
  ];

  return (
    <div className="hc-services-container">
      <div className="container">
        <div className="hc-section-intro">
          <div className="hc-section-intro-copy">
            <span className="hc-eyebrow">Explore the marketplace</span>
            <h2 className="hc-section-title">Start with a direction</h2>
            <p className="hc-section-subtitle">From first sketch to final launch, find the specialists who can move your work forward.</p>
          </div>
        </div>
        <div className="row g-4">
          {services.map((service, index) => (
            <div key={service} className="col-lg-3 col-md-6">
              <Link to={`/services?search=${encodeURIComponent(service)}`} className="text-decoration-none text-dark">

              <div className="hc-service-card hc-direction-card card h-100">
              <div className="hc-card-img-container position-relative">
              <img
                src={`/${service.toLowerCase().replace(/\s+/g, '-')}.jpg`} // adjust image path
                alt={service}
                className="w-100 h-100 object-fit-cover hc-service-img"
              />
              <div className="hc-card-overlay">
                <span className="hc-card-index">0{index + 1}</span>
                <div className="hc-card-content">
                  <span className="hc-card-label">Find talent</span>
                  <h5 className="hc-card-title">{service}</h5>
                  <span className="hc-card-arrow" aria-hidden="true">↗</span>
                </div>
              </div>
              </div>
              </div>
                  </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="hc-services-section py-5">
        <div className="container">
          <div className="hc-section-intro hc-section-intro-compact"><div className="hc-section-intro-copy"><span className="hc-eyebrow">Quick starts</span><h2 className="hc-section-title">Popular services</h2><p className="hc-section-subtitle">Jump into the work people are hiring for right now.</p></div></div>
          <div className="row g-4">
            {popular.map((item) => (
              <div key={item.name} className="col-lg-3 col-md-6">
                <Link to="/services" className="text-decoration-none text-dark">

                <div className="hc-service-card card h-100 border-0 text-center p-4">
                  <div className="hc-icon-container mb-3">
                    <FontAwesomeIcon icon={item.icon} size="2x" />
                  </div>
                  <h5 className="hc-service-title m-0">{item.name}</h5>
                </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="hc-why-choose-us py-5">
        <div className="container">
          <h2 className="hc-section-title hc-dev1 text-center mb-5">Why Choose Us</h2>
          <div className="row g-4">
            {features.map((feature) => (
              <div key={feature.title} className="col-lg-4 col-md-6">
                <div className="hc-feature-card text-center p-4 h-100">
                  <div className="hc-icon-wrapper mb-3">
                    <FontAwesomeIcon icon={feature.icon} />
                  </div>
                  <h4 className="hc-feature-title mb-3">{feature.title}</h4>
                  <p className="hc-feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
