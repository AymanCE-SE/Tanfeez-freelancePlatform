import React from 'react';
import '../styles/About.css';

export default function About() {
  return (
    <div className="about-TANFEEZ about-page">
      <div className="about-header">
        <h1 className="about-title">About TANFEEZ Platform</h1>
        <div className="about-underline"></div>
      </div>
      
      <div className="about-content">
        <p className="about-paragraph">
          TANFEEZ is a large online marketplace for buying and selling services. It connects professional freelancers with business owners and companies to provide quick solutions they need at affordable prices without compromising on quality.
        </p>
        
        <div className="about-highlight">
          <p className="about-highlight-text">
            We aim to empower individuals and businesses to access the best services and creative solutions they need to grow their businesses easily through a trusted platform.
          </p>
        </div>
        
        <p className="about-paragraph">
          TANFEEZ offers a wide range of services including programming and development, graphic design, digital marketing, video and audio production, writing and translation, social media management, and more. Whatever service you need, you'll find the right professional freelancer on Khamsat.
        </p>
        
        <div className="about-services-grid">
          <div className="about-service-card">Programming & Development</div>
          <div className="about-service-card">Graphic Design</div>
          <div className="about-service-card">Digital Marketing</div>
          <div className="about-service-card">Video & Audio</div>
          <div className="about-service-card">Writing & Translation</div>
          <div className="about-service-card">Social Media</div>
        </div>

        <div className="about-brand-section">
          <h2 className="about-subtitle">TANFEEZ</h2>
          <div className="about-underline"></div>
          <p className="about-paragraph">
            TANFEEZ aims to develop the Arab world by providing solutions and products that help ambitious youth to work and grow. TANFEEZ focuses its activities on the future of work and education, serving hundreds of thousands of users from various countries.
          </p>
        </div>

        {/* Team Members */}
        <h2 className="about-team-title">Operated By</h2>
        <div className="about-underline"></div>
        <div className="about-team-grid">
          {[
            { name: "Mohamed Hassan", img: "../logo/mhadad.jpeg" },
            { name: "Ayman Samir", img: "../logo/ayman.jpeg" },
            { name: "Saraa Talat Ali", img: "../logo/images (1).jpeg" },
            { name: "Mohamed Akram", img: "./logo/Tanfeez.png" },
            { name: "Mohamed Emad", img: "./logo/Tanfeez.png" },
            { name: "Mohamed Hosny", img: "./logo/Tanfeez.png" },
          ].map((person, index) => (
            <div key={index} className="about-member-card">
              <img src={person.img} alt={person.name} className="about-member-image" />
              <p className="about-member-name">{person.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
