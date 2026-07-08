import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import { projectAPI } from '../../api/api';
import './AdminDashboard.css';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectAPI.list().then(res => {
      const data = res.data?.data;
      setProjects(Array.isArray(data) ? data : data?.results || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard-page"><p>Loading projects...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet><title>All Projects - Admin | ProjectHub</title></Helmet>
      <div className="dashboard-header-text">
        <h1>All Projects</h1>
        <p>View, manage and oversee all projects across departments.</p>
      </div>
      <Card className="dash-section-card">
        {projects.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No projects found in the system.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table" style={{ width: '100%', minWidth: '800px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Project Title</th>
                  <th style={{ padding: '1rem' }}>Team</th>
                  <th style={{ padding: '1rem' }}>Guide</th>
                  <th style={{ padding: '1rem' }}>Domain</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Approval</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{p.title}</td>
                    <td style={{ padding: '1rem' }}>{p.team_name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{p.guide_name || 'Unassigned'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{p.domain}</td>
                    <td style={{ padding: '1rem' }}><span className={`status-badge ${p.status?.toLowerCase().replace('_', '-')}`}>{p.status}</span></td>
                    <td style={{ padding: '1rem' }}><span className={`status-badge ${p.approval_status?.toLowerCase().replace('_', '-')}`}>{p.approval_status}</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminProjects;
