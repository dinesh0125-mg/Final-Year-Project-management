import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import { milestoneAPI } from '../../api/api';
import './StudentDashboard.css';

const Milestones = () => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    milestoneAPI.list().then((res) => {
      const data = res.data?.data;
      setMilestones(Array.isArray(data) ? data : (data?.results || []));
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await milestoneAPI.update(id, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="dashboard-page"><p>Loading milestones...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet>
        <title>Milestones - ProjectHub</title>
      </Helmet>
      
      <div className="dashboard-header-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Project Milestones</h1>
          <p>Track your project timeline and deliverables.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        <Card>
          <div className="milestone-list" style={{ padding: 'var(--spacing-md)' }}>
            {milestones.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No milestones found for your project.</p>
            )}
            {milestones.map((milestone, idx) => {
              const statusClass = (milestone.status || 'pending').toLowerCase().replace('_', '-');
              return (
                <motion.div 
                  key={milestone.id} 
                  className="milestone-item" 
                  style={{ padding: '1.5rem', alignItems: 'center' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <div className={`milestone-indicator ${statusClass}`} style={{ width: '16px', height: '16px', marginTop: 0 }}></div>
                  <div className="milestone-details">
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{milestone.title}</h3>
                    <p style={{ marginBottom: '0.5rem' }}>Due: {milestone.due_date}</p>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{milestone.description}</p>
                    {milestone.review_feedback && (
                      <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--background)', borderRadius: '4px', fontSize: '0.85rem' }}>
                        <strong>Feedback:</strong> {milestone.review_feedback}
                      </div>
                    )}
                  </div>
                  <div>
                    {['GUIDE_APPROVED', 'APPROVED', 'REJECTED'].includes(milestone.status) ? (
                      <span className={`milestone-badge ${statusClass}`} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                        {milestone.status.replace('_', ' ')}
                      </span>
                    ) : (
                      <select
                        value={milestone.status}
                        onChange={(e) => handleUpdateStatus(milestone.id, e.target.value)}
                        className={`milestone-badge ${statusClass}`}
                        style={{ padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', border: 'none', appearance: 'none', background: 'var(--background)' }}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="SUBMITTED">SUBMITTED</option>
                      </select>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Milestones;
