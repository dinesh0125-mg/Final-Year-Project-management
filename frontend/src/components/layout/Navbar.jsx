import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/';
    switch(user.role) {
      case 'STUDENT': return '/dashboard';
      case 'GUIDE': return '/guide';
      case 'HOD': return '/hod';
      case 'ADMIN': return '/admin';
      default: return '/dashboard';
    }
  };

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="ProjectHub Logo" className="logo-image" />
          <span>ProjectHub</span>
        </Link>
        
        <div className="navbar-links">
          <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} end>Home</NavLink>
          <NavLink to="/features" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Features</NavLink>
          <NavLink to="/projects" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Projects</NavLink>
          <NavLink to="/guides" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Guides</NavLink>
          <NavLink to="/about" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>About</NavLink>
          <NavLink to="/contact" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Contact</NavLink>
        </div>

        <div className="navbar-actions">
          {user ? (
            <Link to={getDashboardLink()} className="user-profile-nav" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--text)' }}>
              <img 
                src={user.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=random`} 
                alt="Profile" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontWeight: '600', fontSize: '0.9rem', lineHeight: '1.2' }}>{user.full_name || 'User'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', lineHeight: '1.2' }}>{user.role}</span>
              </div>
            </Link>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Button variant="primary" onClick={() => navigate('/register')}>Get Started &rarr;</Button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
