import React from 'react';
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer py-5 text-light">
      <div className="container">
        <div className="row gy-4">

          {/* About */}
          <div className="col-md-4">
            <p className="footer-kicker">Tanfeez marketplace</p>
            <h3 className="text-white">Work that moves forward.</h3>
            <p className="footer-description">
              Connect with trusted clients and independent talent to turn good ideas into finished work.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-2">
            <h5 className="text-white">Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/services" className="footer-link">Services</Link></li>
              <li><Link to="/about" className="footer-link">About</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="col-md-3">
            <h5 className="text-white">Follow Us</h5>
            <div className="d-flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-icon">
                <i className="fab fa-facebook-f"></i>
              </a>
              
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-icon">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-icon">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="col-md-3">
            <h5 className="text-white">Newsletter</h5>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="footer-email" className="visually-hidden">Email address</label>
              <input id="footer-email" type="email" placeholder="Your email address" className="form-control" required />
              <button className="btn w-100" type="submit">Subscribe</button>
            </form>
          </div>

        </div>

        <hr className="border-secondary my-4" />

        <div className="text-center small text-muted">
          &copy; {new Date().getFullYear()} Tanfeez. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
