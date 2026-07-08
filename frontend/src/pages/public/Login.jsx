import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Navbar from '../../components/layout/Navbar';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = (role) => {
    const map = { STUDENT: '/dashboard', GUIDE: '/guide', HOD: '/hod', ADMIN: '/admin' };
    return map[role] || '/dashboard';
  };

  const performLogin = async (loginEmail, loginPassword) => {
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ email: loginEmail, password: loginPassword });
      const { user, access, refresh } = res.data.data;
      login(user, access, refresh);
      
      if (loginEmail.endsWith('@demo.com') || loginEmail.endsWith('@university.in')) {
        localStorage.setItem('demo_session_start', Date.now().toString());
      }
      
      navigate(getDashboardPath(user.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    performLogin(demoEmail, 'password123');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    performLogin(email, password);
  };

  return (
    <div className="auth-page">
      <Helmet>
        <title>Login - ProjectHub</title>
      </Helmet>
      
      <Navbar />

      <div className="auth-container">
        <div className="auth-image-side">
          <img 
            src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1200" 
            alt="Meeting" 
            className="auth-image"
          />
          <div className="auth-image-overlay">
            <h2>Welcome Back!</h2>
            <p>Access your dashboard to manage your project milestones and submissions.</p>
          </div>
        </div>
        
        <div className="auth-form-side">
          <motion.div 
            className="auth-form-wrapper"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="auth-header">
              <Link to="/" className="auth-logo">
                <img src="/logo.png" alt="ProjectHub Logo" className="logo-image" />
                <span>ProjectHub</span>
              </Link>
              <h1>Sign in to your account</h1>
              <p>Enter your details to proceed.</p>
            </div>
            
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleLogin} className="auth-form">
              <Input 
                label="Email Address" 
                type="email" 
                id="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input 
                label="Password" 
                type="password" 
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" /> Remember me
                </label>
                <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
              </div>
              
              <Button type="submit" variant="primary" size="lg" className="full-width" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <p style={{ margin: '0 0 1rem 0', fontWeight: '600', color: 'var(--primary)' }}> Quick Demo Login</p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button type="button" variant="outline" size="sm" onClick={() => handleDemoLogin('student@university.in')} disabled={loading}>Student</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleDemoLogin('guide.cse@university.in')} disabled={loading}>Guide</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleDemoLogin('hod.cse@university.in')} disabled={loading}>HOD</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleDemoLogin('admin@university.in')} disabled={loading}>Admin</Button>
              </div>
            </div>
            
            <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
              Don't have an account? <Link to="/register">Create an account</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
