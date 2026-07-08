import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { departmentAPI, userAPI } from '../../api/api';
import './AdminDashboard.css';
import { FiX } from 'react-icons/fi';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    hod: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [dRes, hRes] = await Promise.all([
        departmentAPI.list(),
        userAPI.list({ role: 'HOD' })
      ]);
      const deptsData = Array.isArray(dRes.data?.data) ? dRes.data.data : (dRes.data?.data?.results || []);
      const hodsData = Array.isArray(hRes.data?.data) ? hRes.data.data : (hRes.data?.data?.results || []);
      
      setDepartments(deptsData);
      setHods(hodsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.hod) delete payload.hod; // Don't send empty string
      await departmentAPI.create(payload);
      setShowAdd(false);
      setFormData({ name: '', code: '', description: '', hod: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="dashboard-page"><p>Loading departments...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet><title>Departments - ProjectHub</title></Helmet>
      
      <div className="dashboard-header-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Departments</h1>
          <p>Manage academic departments and their configurations.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiX /> Cancel</span> : '+ Add Department'}
        </Button>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Add New Department</h3>
            <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <Input label="Department Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <Input label="Department Code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
              
              <div className="input-group">
                <label className="input-label">Assign HOD (Optional)</label>
                <select className="input-field" value={formData.hod} onChange={e => setFormData({...formData, hod: e.target.value})}>
                  <option value="">No HOD Assigned</option>
                  {hods.map(h => <option key={h.id} value={h.id}>{h.full_name}</option>)}
                </select>
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Description</label>
                <textarea className="input-field" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Department'}</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {departments.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No departments found.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {departments.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card hover style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>{d.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Code: {d.code}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>HOD: <strong style={{ color: 'var(--text-primary)' }}>{d.hod_name || 'Unassigned'}</strong></p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                  {[['Students', d.student_count || 0], ['Guides', d.guide_count || 0], ['Projects', d.project_count || 0]].map(([label, val]) => (
                    <div key={label} style={{ padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{val}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDepartments;
