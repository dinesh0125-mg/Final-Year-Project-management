import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/api';
import './HodDashboard.css';

const HodSettings = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let payload = formData;
      if (formData.profile_image) {
        payload = new FormData();
        payload.append('full_name', formData.full_name);
        payload.append('phone', formData.phone);
        payload.append('profile_image', formData.profile_image);
      }
      const res = await authAPI.updateMe(payload);
      updateUser(res.data.data);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Helmet><title>Settings - ProjectHub</title></Helmet>
      
      <div className="dashboard-header-text">
        <h1>Account Settings</h1>
        <p>Update your personal information and preferences.</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card style={{ padding: 'var(--spacing-xl)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Profile Information</h2>
            
            {success && <div style={{ color: 'var(--success)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(32, 201, 151, 0.1)', borderRadius: 'var(--radius-sm)' }}>{success}</div>}
            {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            <form style={{ maxWidth: '600px' }} onSubmit={handleUpdate}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <img 
                  src={formData.profile_image_preview || user?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=random`} 
                  alt="Avatar" 
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <input 
                    type="file" 
                    id="profile_image_input" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({ 
                          ...formData, 
                          profile_image: file, 
                          profile_image_preview: URL.createObjectURL(file) 
                        });
                      }
                    }} 
                    style={{ display: 'none' }} 
                  />
                  <Button variant="outline" type="button" onClick={() => document.getElementById('profile_image_input').click()}>
                    Change Picture
                  </Button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input label="Full Name" id="name" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required />
                <Input label="Phone" id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <Input label="Email Address" type="email" id="email" value={user?.email || ''} disabled />
                <Input label="Role" id="role" value={user?.role || ''} disabled />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '1rem' }}>
                <Input label="Department" id="dept" value={user?.department_name || 'Not Assigned'} disabled />
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default HodSettings;
