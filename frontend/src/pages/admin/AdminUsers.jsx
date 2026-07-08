import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { userAPI, departmentAPI } from '../../api/api';
import './AdminDashboard.css';
import { FiX } from 'react-icons/fi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'STUDENT',
    department: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [uRes, dRes] = await Promise.all([
        userAPI.list(),
        departmentAPI.list()
      ]);
      const usersData = Array.isArray(uRes.data?.data) ? uRes.data.data : (uRes.data?.data?.results || []);
      const deptsData = Array.isArray(dRes.data?.data) ? dRes.data.data : (dRes.data?.data?.results || []);
      
      setUsers(usersData);
      setDepartments(deptsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await userAPI.create(formData);
      setShowAdd(false);
      setFormData({ full_name: '', email: '', phone: '', role: 'STUDENT', department: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user. Make sure email is unique.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userAPI.delete(id);
        fetchData();
      } catch (err) {
        console.error("Failed to delete user", err);
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const filtered = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.role || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      <Helmet><title>User Management - ProjectHub</title></Helmet>
      
      <div className="dashboard-header-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>User Management</h1>
          <p>Add, edit, and manage all platform users.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiX /> Cancel</span> : '+ Add User'}
        </Button>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create New User</h3>
            <form onSubmit={handleAddUser} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <Input label="Full Name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
              <Input label="Email Address" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              <div className="input-group">
                <label className="input-label">Role</label>
                <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required>
                  <option value="STUDENT">Student</option>
                  <option value="GUIDE">Guide</option>
                  <option value="HOD">HOD</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Department (Optional for Admin)</label>
                <select className="input-field" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <Input label="Phone Number (Optional)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create User'}</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <div style={{ marginBottom: '1.5rem', maxWidth: 400 }}>
        <Input label="" id="admin-user-search" placeholder="Search by name, email or role..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="dash-section-card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table" style={{ width: '100%', minWidth: '800px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>User</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Role</th>
                  <th style={{ padding: '1rem' }}>Department</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div className="student-chip" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img 
                          src={u.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'User')}&background=random`} 
                          alt={u.full_name} 
                          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontWeight: 600 }}>{u.full_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}><span className={`status-badge active`}>{u.role}</span></td>
                    <td style={{ padding: '1rem' }}>{u.department_name || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button variant="ghost" size="sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(u.id)}>Delete</Button>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No users found matching your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminUsers;
