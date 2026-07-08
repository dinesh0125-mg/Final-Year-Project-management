import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { notificationAPI } from '../../api/api';
import './StudentDashboard.css';
import { FiBell, FiCheckCircle } from 'react-icons/fi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    notificationAPI.list().then(res => {
      const data = res.data?.data;
      setNotifications(Array.isArray(data) ? data : data?.results || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    await notificationAPI.markRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllRead();
    fetchNotifications();
  };

  if (loading) return <div className="dashboard-page"><p>Loading...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet><title>Notifications - ProjectHub</title></Helmet>
      <div className="dashboard-header-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1>Notifications</h1><p>Stay updated on your project activities.</p></div>
        {notifications.length > 0 && <Button variant="outline" onClick={handleMarkAllRead}><FiCheckCircle style={{ marginRight: 4 }} /> Mark All Read</Button>}
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        {notifications.length === 0 ? (
          <Card style={{ padding: '3rem', textAlign: 'center' }}>
            <FiBell size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
            <h3>No notifications</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You're all caught up!</p>
          </Card>
        ) : (
          <Card>
            <div style={{ padding: '0.5rem' }}>
              {notifications.map((n, idx) => (
                <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: idx < notifications.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: n.is_read ? 'transparent' : 'rgba(91,95,239,0.04)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block' }}></span>}
                      <h4 style={{ fontSize: '1rem' }}>{n.title}</h4>
                      <span className={`milestone-badge ${n.type?.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{n.type}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{n.message}</p>
                  </div>
                  {!n.is_read && <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}>Mark Read</Button>}
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notifications;
