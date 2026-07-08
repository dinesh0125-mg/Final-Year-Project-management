import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { meetingAPI, teamAPI } from '../../api/api';
import './StudentDashboard.css';
import { FiVideo, FiClock, FiCalendar as CalendarIcon, FiMapPin, FiX } from 'react-icons/fi';

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequest, setShowRequest] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meeting_date: '',
    meeting_time: '',
    mode: 'ONLINE',
    venue_or_link: '',
  });

  const fetchData = async () => {
    try {
      const teamRes = await teamAPI.myTeam();
      const myTeam = teamRes.data?.data;
      setTeam(myTeam);

      const meetingRes = await meetingAPI.list();
      const meets = Array.isArray(meetingRes.data?.data) ? meetingRes.data.data : (meetingRes.data?.data?.results || []);
      setMeetings(meets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError('');
    if (!team || !team.guide) {
      setError("You must be in a team with an assigned guide to request a meeting.");
      return;
    }

    setRequesting(true);
    try {
      await meetingAPI.create({
        ...formData,
        team: team.id,
        guide: team.guide
      });
      setShowRequest(false);
      setFormData({ title: '', description: '', meeting_date: '', meeting_time: '', mode: 'ONLINE', venue_or_link: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request meeting.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="dashboard-page"><p>Loading meetings...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet><title>Meetings - ProjectHub</title></Helmet>
      
      <div className="dashboard-header-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Meetings & Schedule</h1>
          <p>Upcoming reviews and guide meetings.</p>
        </div>
        <Button variant="primary" onClick={() => setShowRequest(!showRequest)}>
          {showRequest ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiX /> Cancel</span> : 'Request Meeting'}
        </Button>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {showRequest && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Request a Meeting with Guide</h3>
            <form onSubmit={handleRequest} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <Input label="Meeting Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              <div className="input-group">
                <label className="input-label">Mode</label>
                <select className="input-field" value={formData.mode} onChange={e => setFormData({...formData, mode: e.target.value})} required>
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </div>
              <Input type="date" label="Date" value={formData.meeting_date} onChange={e => setFormData({...formData, meeting_date: e.target.value})} required />
              <Input type="time" label="Time" value={formData.meeting_time} onChange={e => setFormData({...formData, meeting_time: e.target.value})} required />
              <Input label="Venue or Meeting Link" value={formData.venue_or_link} onChange={e => setFormData({...formData, venue_or_link: e.target.value})} required />
              
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Description (Optional)</label>
                <textarea className="input-field" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <Button type="submit" variant="primary" disabled={requesting}>
                  {requesting ? 'Requesting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {meetings.length === 0 ? (
          <Card style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
            <CalendarIcon size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
            <h3>No Meetings</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You have no requested or scheduled meetings.</p>
          </Card>
        ) : (
          meetings.map((meeting) => (
            <motion.div key={meeting.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="meeting-card" hover style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>{meeting.title}</h3>
                  <div style={{ backgroundColor: meeting.mode === 'ONLINE' ? 'rgba(91, 95, 239, 0.1)' : 'rgba(32, 201, 151, 0.1)', color: meeting.mode === 'ONLINE' ? 'var(--primary)' : 'var(--success)', padding: '8px', borderRadius: '50%' }}>
                    {meeting.mode === 'ONLINE' ? <FiVideo size={20} /> : <FiMapPin size={20} />}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarIcon /> <span>{meeting.meeting_date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiClock /> <span>{meeting.meeting_time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '500' }}>Host:</span> {meeting.guide_name || 'Guide'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span className={`milestone-badge ${meeting.status?.toLowerCase().replace('_', '-')}`}>{meeting.status}</span>
                  </div>
                </div>
                
                {meeting.mode === 'ONLINE' && meeting.venue_or_link && (
                  <Button variant="outline" className="full-width" onClick={() => window.open(meeting.venue_or_link, '_blank')}>Join Meeting</Button>
                )}
                {meeting.mode === 'OFFLINE' && meeting.venue_or_link && (
                  <div style={{ padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiMapPin style={{ color: 'var(--text-secondary)' }} /> {meeting.venue_or_link}
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

export default Meetings;
