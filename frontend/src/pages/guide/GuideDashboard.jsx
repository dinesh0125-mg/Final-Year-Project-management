import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import { dashboardAPI } from '../../api/api';
import { useAuth } from '../../hooks/useAuth';
import { FiUsers, FiFolder, FiCheckSquare, FiMessageSquare } from 'react-icons/fi';
import './GuideDashboard.css';

const GuideDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.guide().then(res => setData(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard-page"><p>Loading dashboard...</p></div>;

  const stats = [
    { label: 'Allocated Teams', value: data?.total_teams || 0, icon: <FiUsers />, color: 'blue' },
    { label: 'Pending Approvals', value: data?.pending_approvals || 0, icon: <FiFolder />, color: 'orange' },
    { label: 'Pending Docs', value: data?.pending_documents || 0, icon: <FiMessageSquare />, color: 'red' },
    { label: 'Upcoming Meetings', value: data?.upcoming_meetings || 0, icon: <FiCheckSquare />, color: 'green' },
  ];

  const teams = data?.teams || [];

  return (
    <div className="dashboard-page">
      <Helmet><title>Guide Dashboard - ProjectHub</title></Helmet>

      <div className="dashboard-header-text">
        <h1>Welcome, {user?.full_name || 'Guide'} </h1>
        <p>Monitor your students' progress and pending reviews.</p>
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

      <div className="dash-two-col">
        <Card className="dash-section-card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="dash-section-title" style={{ margin: 0 }}>My Allocated Teams</h3>
            <Link to="/guide/students" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>View All</Link>
          </div>
          <div>
            {teams.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>You have no allocated teams yet.</p>
            ) : (
              teams.slice(0, 5).map((team, i) => (
                <div key={team.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderBottom: i < Math.min(teams.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, marginBottom: 2 }}>{team.team_name} ({team.team_code})</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Leader: {team.leader_name} • Members: {team.member_count}</p>
                  </div>
                  <span className={`status-badge ${team.status?.toLowerCase().replace(' ', '-')}`}>{team.status}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GuideDashboard;
