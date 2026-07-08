import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import { dashboardAPI } from '../../api/api';
import { useAuth } from '../../hooks/useAuth';
import { FiUsers, FiFolder, FiUserCheck, FiGrid, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.admin().then(res => setData(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard-page"><p>Loading dashboard...</p></div>;

  const stats = [
    { label: 'Total Users', value: data?.total_users || 0, icon: <FiUsers />, color: 'blue' },
    { label: 'Active Projects', value: data?.total_projects || 0, icon: <FiFolder />, color: 'green' },
    { label: 'Departments', value: data?.total_departments || 0, icon: <FiGrid />, color: 'purple' },
    { label: 'Guides', value: data?.total_guides || 0, icon: <FiUserCheck />, color: 'orange' },
    { label: 'Completed Projects', value: data?.completed_projects || 0, icon: <FiTrendingUp />, color: 'green' },
    { label: 'Pending Teams', value: data?.pending_teams || 0, icon: <FiAlertCircle />, color: 'red' },
  ];

  const recentUsers = data?.recent_users || [];

  return (
    <div className="dashboard-page">
      <Helmet><title>Admin Dashboard - ProjectHub</title></Helmet>

      <div className="dashboard-header-text">
        <h1>Welcome, {user?.full_name || 'Admin'} ️</h1>
        <p>Platform-wide overview and system management.</p>
      </div>

      <div className="dash-cards-row" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="dash-stat-card">
              <div className={`dash-stat-icon ${s.color}`}>{s.icon}</div>
              <div className="dash-stat-content">
                <h4>{s.label}</h4>
                <p className="dash-stat-value">{s.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="dash-section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="dash-section-title" style={{ margin: 0 }}>Recently Joined Users</h3>
          <Link to="/admin/users" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Manage Users</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="dash-table" style={{ width: '100%', minWidth: '600px' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>No recent users.</td></tr>
              ) : (
                recentUsers.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
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
                    <td style={{ padding: '1rem' }}><span className={`status-badge ${u.role?.toLowerCase()}`}>{u.role}</span></td>
                    <td style={{ padding: '1rem' }}>{u.department_name || 'N/A'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
