import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import './PublicPages.css';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance';

const Contact = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    
    try {
      const res = await axiosInstance.post('contact/', formData);
      setStatusMsg({ type: 'success', text: res.data.message || 'Message sent successfully!' });
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send message.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - ProjectHub</title>
      </Helmet>
      
      <Navbar />
      
      <main className="public-page-main">
        <section className="page-header">
          <div className="container">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }}
            >
              Get in Touch
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Have questions about deploying ProjectHub at your institution? We are here to help.
            </motion.p>
          </div>
        </section>

        <section className="container section-padding">
          <div className="contact-layout">
            <motion.div 
              className="contact-info"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Contact Information</h2>
              
              <div className="contact-info-item">
                <div className="contact-info-icon"><FiMail /></div>
                <div>
                  <h4 style={{ marginBottom: '0.25rem' }}>Email Support</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>support@projecthub.edu</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <div className="contact-info-icon"><FiPhone /></div>
                <div>
                  <h4 style={{ marginBottom: '0.25rem' }}>Phone</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <div className="contact-info-icon"><FiMapPin /></div>
                <div>
                  <h4 style={{ marginBottom: '0.25rem' }}>Headquarters</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>123 Innovation Drive<br/>Tech Park, CA 94043</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="contact-form-container"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 style={{ marginBottom: '1.5rem' }}>Send us a Message</h3>
              
              {statusMsg.text && (
                <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '4px', backgroundColor: statusMsg.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: statusMsg.type === 'error' ? 'var(--error)' : 'var(--success)' }}>
                  {statusMsg.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input label="First Name" id="firstName" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} placeholder="John" required />
                  <Input label="Last Name" id="lastName" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} placeholder="Doe" />
                </div>
                <Input label="Email Address" type="email" id="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@university.edu" required />
                <div className="input-group">
                  <label htmlFor="message" className="input-label">Message</label>
                  <textarea 
                    id="message" 
                    className="input-field" 
                    rows="5" 
                    placeholder="How can we help you?"
                    style={{ resize: 'vertical' }}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                  ></textarea>
                </div>
                <Button variant="primary" type="submit" size="lg" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Contact;
