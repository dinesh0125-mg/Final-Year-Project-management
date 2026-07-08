import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { authAPI } from '../../api/api';
import './Auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await authAPI.requestOtp({ email });
      toast.success('If an account exists, an OTP has been sent to your email.');
      setStep(2);
    } catch (err) {
      toast.error('Failed to request OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.verifyOtp({ email, otp });
      setResetToken(res.data.data.reset_token);
      toast.success('OTP verified successfully!');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, reset_token: resetToken, new_password: newPassword });
      toast.success('Password reset successfully! Please login with your new password.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Helmet>
        <title>Forgot Password - ProjectHub</title>
      </Helmet>
      
      <Navbar />
      
      <main className="auth-container">
        <div className="auth-image-side">
          <img 
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200" 
            alt="Workspace" 
            className="auth-image"
          />
          <div className="auth-image-overlay">
            <h2>Secure Access</h2>
            <p>Recover your account and get back to managing your projects.</p>
          </div>
        </div>
        
        <div className="auth-form-side">
          <motion.div 
            className="auth-form-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
          <div className="auth-header">
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">
              {step === 1 && "Enter your email to receive a reset code"}
              {step === 2 && "Enter the 6-digit code sent to your email"}
              {step === 3 && "Create a new strong password"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step1"
                className="auth-form" 
                onSubmit={handleRequestOtp}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Input
                  label="Email Address"
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@college.edu"
                  required
                />
                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  isLoading={loading}
                >
                  Send OTP
                </Button>
                
                <div className="auth-footer" style={{ marginTop: '1rem' }}>
                  <p>Remember your password? <Link to="/login" className="auth-link">Login here</Link></p>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form 
                key="step2"
                className="auth-form" 
                onSubmit={handleVerifyOtp}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Code sent to <strong>{email}</strong>
                </div>
                <Input
                  label="6-Digit OTP"
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  required
                />
                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  isLoading={loading}
                >
                  Verify OTP
                </Button>
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)} disabled={loading}>
                    Change Email
                  </Button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form 
                key="step3"
                className="auth-form" 
                onSubmit={handleResetPassword}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Input
                  label="New Password"
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  isLoading={loading}
                >
                  Reset Password
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
