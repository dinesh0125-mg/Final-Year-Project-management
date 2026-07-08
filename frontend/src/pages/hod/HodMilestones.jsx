import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { milestoneAPI } from '../../api/api';
import './HodDashboard.css';

const HodMilestones = () => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMilestones = async () => {
    try {
      const res = await milestoneAPI.list();
      const data = res.data?.data;
      setMilestones(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMilestones(); }, []);

  const handleAction = async (id, action) => {
    try {
      const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
      await milestoneAPI.review(id, { status, review_feedback: '' });
      fetchMilestones();
    } catch (err) {
      console.error(err);
      alert('Failed to review milestone');
    }
  };

  if (loading) return <div className="dashboard-page"><p>Loading milestones...</p></div>;

  const pendingMilestones = milestones.filter(m => m.status === 'GUIDE_APPROVED');
  const pastMilestones = milestones.filter(m => m.status !== 'GUIDE_APPROVED' && m.status !== 'SUBMITTED' && m.status !== 'PENDING' && m.status !== 'IN_PROGRESS');

  return (
    <div className="dashboard-page">
      <Helmet><title>Milestone Approvals - ProjectHub</title></Helmet>
      <div className="dashboard-header-text">
        <h1>Milestone Approvals</h1>
        <p>Review and approve milestones that have been approved by guides.</p>
      </div>

      <Card className="dash-section-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--warning)' }}>Pending HOD Approval ({pendingMilestones.length})</h3>
        {pendingMilestones.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No milestones pending HOD approval.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table" style={{ width: '100%', minWidth: '800px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Project</th>
                  <th style={{ padding: '1rem' }}>Milestone Title</th>
                  <th style={{ padding: '1rem' }}>Description</th>
                  <th style={{ padding: '1rem' }}>Due Date</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingMilestones.map((m, i) => (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{m.project_title || `Project ID: ${m.project}`}</td>
                    <td style={{ padding: '1rem' }}>{m.title}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.description}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{m.due_date}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Button variant="primary" size="sm" onClick={() => handleAction(m.id, 'approve')}>Approve</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleAction(m.id, 'reject')}>Reject</Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="dash-section-card">
        <h3 style={{ marginBottom: '1rem' }}>All HOD Reviewed Milestones</h3>
        {pastMilestones.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No milestones found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table" style={{ width: '100%', minWidth: '800px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Project</th>
                  <th style={{ padding: '1rem' }}>Milestone Title</th>
                  <th style={{ padding: '1rem' }}>Due Date</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pastMilestones.map((m, i) => (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{m.project_title || `Project ID: ${m.project}`}</td>
                    <td style={{ padding: '1rem' }}>{m.title}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{m.due_date}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`milestone-badge ${m.status?.toLowerCase().replace('_', '-')}`}>{m.status.replace('_', ' ')}</span>
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

export default HodMilestones;
