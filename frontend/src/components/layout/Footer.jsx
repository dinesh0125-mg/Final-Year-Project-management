import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiLinkedin, FiYoutube } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-main-grid">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <div className="footer-logo-container">
            <img src="/logo.png" alt="ProjectHub Logo" className="footer-logo-img" />
            <span className="footer-brand-name">ProjectHub</span>
          </div>
          <p className="footer-description">
            A unified platform for managing, organizing, and completing engineering final year projects — built for students, guides, and administrators alike.
          </p>
          <div className="footer-social-icons">
            <a href="#" aria-label="Instagram"><FiInstagram /></a>
            <a href="#" aria-label="Twitter"><FiTwitter /></a>
            <a href="#" aria-label="LinkedIn"><FiLinkedin /></a>
            <a href="#" aria-label="YouTube"><FiYoutube /></a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer-links-col">
          <h4>QUICK LINKS</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/projects">Projects</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* For Students Column */}
        <div className="footer-links-col">
          <h4>FOR STUDENTS</h4>
          <ul>
            <li><Link to="/projects">Browse Projects</Link></li>
            <li><Link to="/login">Student Login</Link></li>
            <li><Link to="/login">Submit Documents</Link></li>
            <li><Link to="/login">View Milestones</Link></li>
            <li><Link to="/login">Track Progress</Link></li>
          </ul>
        </div>

        {/* For Staff Column */}
        <div className="footer-links-col">
          <h4>FOR STAFF</h4>
          <ul>
            <li><Link to="/login">Guide Login</Link></li>
            <li><Link to="/login">HOD Login</Link></li>
            <li><Link to="/login">Manage Projects</Link></li>
            <li><Link to="/login">Review Progress</Link></li>
            <li><Link to="/login">Participants</Link></li>
          </ul>
        </div>

        {/* Support Column */}
        <div className="footer-links-col">
          <h4>SUPPORT</h4>
          <ul>
            <li><Link to="/contact">FAQ</Link></li>
            <li><Link to="/contact">Privacy Policy</Link></li>
            <li><Link to="/contact">Terms & Conditions</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
            <li><Link to="/login">Admin Login</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© 2026 ProjectHub. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/contact">Privacy Policy</Link>
            <Link to="/contact">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
