import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import { dashboardAPI } from '../../api/api';
import { useAuth } from '../../hooks/useAuth';
import { FiUsers, FiFolder, FiCheckSquare, FiUserCheck } from 'react-icons/fi';
import './HodDashboard.css';

const HodDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.hod().then(res => setData(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard-page"><p>Loading dashboard...</p></div>;

  const stats = [
    { label: 'Total Students', value: data?.total_students || 0, icon: <FiUsers />, color: 'blue' },
    { label: 'Active Projects', value: data?.total_projects || 0, icon: <FiFolder />, color: 'green' },
    { label: 'Guides Onboard', value: data?.total_guides || 0, icon: <FiUserCheck />, color: 'purple' },
    { label: 'Pending Approvals', value: data?.pending_approvals || 0, icon: <FiCheckSquare />, color: 'orange' },
  ];

  const recentProjects = data?.recent_projects || [];

  return (
    <div className="dashboard-page">
      <Helmet><title>HOD Dashboard - ProjectHub</title></Helmet>

      <div className="dashboard-header-text">
        <h1>Welcome, {user?.full_name || 'HOD'} </h1>
        <p>Department overview and project performance at a glance.</p>
      </div>

      <div className="dash-cards-row">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
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
          <h3 className="dash-section-title" style={{ margin: 0 }}>Recent Projects</h3>
          <Link to="/hod/projects" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>View All Projects</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="dash-table" style={{ width: '100%', minWidth: '600px' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th>Project Title</th>
                <th>Guide Name</th>
                <th>Review Status</th>
                <th>Meeting Status</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>No projects found.</td></tr>
              ) : (
                recentProjects.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.guide_name || 'Unassigned'}</td>
                    <td><span className={`status-badge ${p.status?.toLowerCase().replace('_', '-')}`}>{p.status}</span></td>
                    <td><span className="status-badge requested">Scheduled</span></td> {/* Mocked meeting status as requested */}
                    <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px' }}>
                                <div style={{ width: `${p.progress_percentage}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.progress_percentage}%</span>
                        </div>
                    </td>
                    <td>
                        <button className="btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => window.location.href=`/hod/projects/${p.id}`}>View Proposal</button>
                    </td>
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

export default HodDashboard;
