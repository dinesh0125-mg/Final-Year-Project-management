import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI, departmentAPI } from '../../api/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Navbar from '../../components/layout/Navbar';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'STUDENT',
    department: '',
  });

  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    departmentAPI
      .list()
      .then((res) => {
        const data = res.data?.data;
        setDepartments(Array.isArray(data) ? data : data?.results || []);
      })
      .catch((err) => {
        console.error('DEPARTMENTS ERROR:', err);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...formData };

      if (!payload.department) {
        delete payload.department;
      }

      await authAPI.register(payload);
      navigate('/login');
    } catch (err) {
      const errors = err.response?.data?.errors;

      if (errors) {
        const firstKey = Object.keys(errors)[0];
        setError(
          Array.isArray(errors[firstKey])
            ? errors[firstKey][0]
            : errors[firstKey]
        );
      } else {
        setError(err.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Helmet>
        <title>Register - ProjectHub</title>
      </Helmet>

      <Navbar />

      <div className="auth-container">
        <div className="auth-image-side">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200"
            alt="Students collaborating"
            className="auth-image"
          />
          <div className="auth-image-overlay">
            <h2>Join ProjectHub</h2>
            <p>
              Streamline your academic projects, collaborate with your team, and
              track your milestones effectively.
            </p>
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
                <img
                  src="/logo.png"
                  alt="ProjectHub Logo"
                  className="logo-image"
                />
                <span>ProjectHub</span>
              </Link>

              <h1>Create an account</h1>
              <p>Fill in the details to get started.</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleRegister} className="auth-form">
              <Input
                label="Full Name"
                type="text"
                id="full_name"
                name="full_name"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleChange}
                required
              />

              <Input
                label="Email Address"
                type="email"
                id="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                id="phone"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
              />

              <Input
                label="Password"
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <div className="input-group">
                <label className="input-label" htmlFor="role">
                  I am a
                </label>
                <select
                  id="role"
                  name="role"
                  className="input-field"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="STUDENT">Student</option>
                  <option value="GUIDE">Guide</option>
                  <option value="HOD">HOD</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="department">
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  className="input-field"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="full-width"
                style={{ marginTop: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
