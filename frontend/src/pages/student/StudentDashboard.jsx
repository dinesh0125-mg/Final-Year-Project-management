import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import { dashboardAPI } from '../../api/api';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import './StudentDashboard.css';
import { FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.student().then(res => setData(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const project = data?.project;
  const milestones = data?.milestones || [];
  const meetings = data?.upcoming_meetings || [];
  const team = data?.team;

  return (
    <div className="student-dashboard">
      <Helmet><title>Dashboard - ProjectHub</title></Helmet>
      
      <div className="dashboard-header-text">
        <h1>Welcome back{team ? `, ${team.team_name}` : ''}! </h1>
        <p>{project ? `Working on: ${project.title}` : 'Get started by creating or joining a team.'}</p>
      </div>

      <div className="dashboard-summary-cards">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="summary-card">
            <div className="sc-icon text-primary"><FiCheckCircle /></div>
            <div className="sc-content">
              <h3>Overall Progress</h3>
              <p className="sc-value">{data?.progress_percentage || 0}%</p>
            </div>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="summary-card">
            <div className="sc-icon text-warning"><FiClock /></div>
            <div className="sc-content">
              <h3>Upcoming Meetings</h3>
              <p className="sc-value">{meetings.length}</p>
            </div>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="summary-card">
            <div className="sc-icon text-danger"><FiAlertCircle /></div>
            <div className="sc-content">
              <h3>Pending Docs</h3>
              <p className="sc-value">{data?.pending_documents || 0}</p>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="dashboard-grid">
        <motion.div className="dashboard-activity-container" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="chart-card">
            <div className="mc-header"><h3>Upcoming Meetings</h3></div>
            <div className="activity-list">
              {meetings.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No upcoming meetings.</p>}
              {meetings.map((m, idx) => (
                <div key={idx} className="activity-item">
                  <div className={`milestone-indicator ${m.status === 'SCHEDULED' ? 'completed' : 'pending'}`}></div>
                  <div className="activity-details">
                    <h4>{m.title}</h4>
                    <p>{m.meeting_date} at {m.meeting_time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
        
        <motion.div className="dashboard-milestones" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="milestones-card">
            <div className="mc-header">
              <h3>Project Milestones</h3>
              <Link to="/dashboard/milestones" className="view-all-link">View All</Link>
            </div>
            <div className="milestone-list">
              {milestones.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No milestones yet.</p>}
              {milestones.map((milestone, idx) => {
                const statusClass = (milestone.status || '').toLowerCase().replace('_', '-');
                return (
                  <div key={idx} className="milestone-item">
                    <div className={`milestone-indicator ${statusClass}`}></div>
                    <div className="milestone-details">
                      <h4>{milestone.title}</h4>
                      <p>Due: {milestone.due_date}</p>
                    </div>
                    <div className={`milestone-badge ${statusClass}`}>{milestone.status}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
