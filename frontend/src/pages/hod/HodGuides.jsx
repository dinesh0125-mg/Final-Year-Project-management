import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import { userAPI } from '../../api/api';
import './HodDashboard.css';

const HodGuides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.list({ role: 'GUIDE' }).then(res => {
      const data = res.data?.data;
      setGuides(Array.isArray(data) ? data : data?.results || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard-page"><p>Loading guides...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet><title>Guides - ProjectHub</title></Helmet>
      <div className="dashboard-header-text">
        <h1>Department Guides</h1>
        <p>Manage guide allocations and workloads.</p>
      </div>
      <Card className="dash-section-card">
        {guides.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No guides found in your department.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table" style={{ width: '100%', minWidth: '600px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Guide</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Department</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {guides.map((g, i) => (
                  <motion.tr key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div className="student-chip" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img 
                          src={g.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(g.full_name || 'User')}&background=random`} 
                          alt={g.full_name} 
                          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontWeight: 600 }}>{g.full_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{g.email}</td>
                    <td style={{ padding: '1rem' }}>{g.department_name}</td>
                    <td style={{ padding: '1rem' }}><span className={`status-badge ${g.is_active ? 'active' : 'inactive'}`}>{g.is_active ? 'Active' : 'Inactive'}</span></td>
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

export default HodGuides;
