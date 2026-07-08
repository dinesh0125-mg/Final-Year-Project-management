import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import { projectAPI, userAPI, teamAPI } from '../../api/api';
import './HodDashboard.css';

const HodProjects = () => {
  const [projects, setProjects] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [projRes, guideRes] = await Promise.all([
        projectAPI.list(),
        userAPI.list({ role: 'GUIDE' })
      ]);
      const data = projRes.data?.data;
      setProjects(Array.isArray(data) ? data : data?.results || []);
      
      const gData = guideRes.data?.data;
      setGuides(Array.isArray(gData) ? gData : gData?.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignGuide = async (teamId, guideId) => {
    if (!guideId) return;
    try {
      await teamAPI.allocateGuide(teamId, { guide_id: guideId });
      fetchData(); // Refresh to show new guide
    } catch (err) {
      console.error(err);
      alert('Failed to assign guide');
    }
  };

  if (loading) return <div className="dashboard-page"><p>Loading projects...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet><title>All Projects - ProjectHub</title></Helmet>
      <div className="dashboard-header-text">
        <h1>All Department Projects</h1>
        <p>View and manage every project in your department.</p>
      </div>
      <Card className="dash-section-card">
        {projects.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No projects found in your department.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table" style={{ width: '100%', minWidth: '800px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Project Title</th>
                  <th style={{ padding: '1rem' }}>Team</th>
                  <th style={{ padding: '1rem' }}>Guide</th>
                  <th style={{ padding: '1rem' }}>Progress</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{p.title}</td>
                    <td style={{ padding: '1rem' }}>{p.team_name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      <select 
                        onChange={(e) => handleAssignGuide(p.team, e.target.value)}
                        style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                        value={guides.find(g => g.full_name === p.guide_name)?.id || ""}
                      >
                        <option value="" disabled>Assign Guide</option>
                        {guides.map(g => (
                          <option key={g.id} value={g.id}>{g.full_name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ flex: 1, height: 6, backgroundColor: 'var(--border)', borderRadius: 3, minWidth: 80 }}>
                          <div style={{ width: `${p.progress_percentage || 0}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: 3 }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{p.progress_percentage || 0}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}><span className={`status-badge ${p.status?.toLowerCase().replace('_', '-')}`}>{p.status}</span></td>
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

export default HodProjects;
