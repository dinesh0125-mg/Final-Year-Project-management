import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import { vivaAPI } from '../../api/api';
import './StudentDashboard.css';
import { FiCalendar, FiMapPin, FiClock } from 'react-icons/fi';

const VivaSchedule = () => {
  const [vivas, setVivas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vivaAPI.list().then(res => {
      const data = res.data?.data;
      setVivas(Array.isArray(data) ? data : data?.results || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard-page"><p>Loading...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet><title>Viva Schedule - ProjectHub</title></Helmet>
      <div className="dashboard-header-text">
        <h1>Viva Schedule</h1>
        <p>View your upcoming and past viva schedules.</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {vivas.length === 0 ? (
          <Card style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1' }}>
            <FiCalendar size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
            <h3>No Viva Scheduled</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Your viva schedule will appear here once it is scheduled by the HOD.</p>
          </Card>
        ) : vivas.map((v, idx) => (
          <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card hover style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem' }}>{v.project_title || 'Viva'}</h3>
                <span className={`milestone-badge ${v.status?.toLowerCase()}`}>{v.status}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiCalendar /> <span>{v.viva_date}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiClock /> <span>{v.viva_time}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiMapPin /> <span>{v.venue}</span></div>
              </div>
              {v.panel_members && <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong>Panel:</strong> {v.panel_members}</p>}
              {v.remarks && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong>Remarks:</strong> {v.remarks}</p>}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VivaSchedule;
