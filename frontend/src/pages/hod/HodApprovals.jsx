import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { projectAPI } from '../../api/api';
import './HodDashboard.css';

const HodApprovals = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await projectAPI.list();
      const data = res.data?.data;
      setProjects(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await projectAPI.approve(id);
      } else if (action === 'reject') {
        await projectAPI.reject(id);
      }
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="dashboard-page"><p>Loading projects...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet><title>Approvals - ProjectHub</title></Helmet>
      <div className="dashboard-header-text">
        <h1>Project Approvals</h1>
        <p>Review and approve or reject student project proposals.</p>
      </div>
      <Card className="dash-section-card">
        {projects.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No projects found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table" style={{ width: '100%', minWidth: '800px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Project Title</th>
                  <th style={{ padding: '1rem' }}>Team</th>
                  <th style={{ padding: '1rem' }}>Guide</th>
                  <th style={{ padding: '1rem' }}>Submitted</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{p.title}</td>
                    <td style={{ padding: '1rem' }}>{p.team_name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{p.guide_name || 'Unassigned'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`status-badge ${p.approval_status?.toLowerCase().replace('_', '-')}`}>{p.approval_status}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {p.approval_status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <Button variant="primary" size="sm" onClick={() => handleAction(p.id, 'approve')}>Approve</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleAction(p.id, 'reject')}>Reject</Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" disabled>{p.approval_status}</Button>
                      )}
                    </td>
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

export default HodApprovals;
