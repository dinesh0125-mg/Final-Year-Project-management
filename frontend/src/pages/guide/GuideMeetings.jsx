import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { meetingAPI } from '../../api/api';
import { FiCalendar, FiClock, FiVideo, FiMapPin } from 'react-icons/fi';

const GuideMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
      const res = await meetingAPI.list();
      const meets = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.results || []);
      setMeetings(meets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMeetings(); }, []);

  const handleAction = async (id, actionStr) => {
    try {
      if (actionStr === 'approve') {
        await meetingAPI.approve(id);
      } else if (actionStr === 'cancel') {
        await meetingAPI.cancel(id);
      }
      fetchMeetings();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="dashboard-page"><p>Loading meetings...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet><title>Meetings - ProjectHub</title></Helmet>
      <div className="dashboard-header-text">
        <h1>Scheduled Meetings</h1>
        <p>Upcoming reviews and guidance sessions with your allocated teams.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {meetings.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', color: 'var(--text-secondary)' }}>No meetings scheduled or requested.</p>
        ) : (
          meetings.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card hover style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{m.team_name}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{m.title}</p>
                  </div>
                  <div style={{ backgroundColor: m.mode === 'ONLINE' ? 'rgba(91, 95, 239, 0.1)' : 'rgba(32, 201, 151, 0.1)', color: m.mode === 'ONLINE' ? 'var(--primary)' : 'var(--success)', padding: '8px', borderRadius: '50%' }}>
                    {m.mode === 'ONLINE' ? <FiVideo size={20} /> : <FiMapPin size={20} />}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><FiCalendar /> {m.meeting_date}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><FiClock /> {m.meeting_time} &nbsp;·&nbsp; {m.mode}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span className={`milestone-badge ${m.status?.toLowerCase().replace('_', '-')}`}>{m.status}</span>
                  </div>
                </div>

                {m.status === 'REQUESTED' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <Button variant="primary" style={{ flex: 1 }} onClick={() => handleAction(m.id, 'approve')}>Approve</Button>
                    <Button variant="outline" style={{ flex: 1 }} onClick={() => handleAction(m.id, 'cancel')}>Reject</Button>
                  </div>
                )}
                
                {m.status === 'SCHEDULED' && m.mode === 'ONLINE' && m.venue_or_link && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <Button variant="outline" style={{ flex: 1 }} onClick={() => window.open(m.venue_or_link, '_blank')}>Join Meeting</Button>
                    <Button variant="ghost" style={{ flex: 1 }} onClick={() => handleAction(m.id, 'cancel')}>Cancel</Button>
                  </div>
                )}

                {m.status === 'SCHEDULED' && m.mode === 'OFFLINE' && m.venue_or_link && (
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FiMapPin style={{ color: 'var(--text-secondary)' }} /> {m.venue_or_link}
                    </div>
                    <Button variant="ghost" className="full-width" onClick={() => handleAction(m.id, 'cancel')}>Cancel</Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default GuideMeetings;
