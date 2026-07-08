import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { teamAPI } from '../../api/api';
import './GuideDashboard.css';

const GuideStudents = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    teamAPI.list().then(res => {
      const data = res.data?.data;
      setTeams(Array.isArray(data) ? data : data?.results || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleView = async (id) => {
    try {
      const res = await teamAPI.get(id);
      setSelectedTeam(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="dashboard-page"><p>Loading teams...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet><title>My Teams - ProjectHub</title></Helmet>
      <div className="dashboard-header-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>My Allocated Teams</h1>
          <p>Overview of all teams and students allocated to you.</p>
        </div>
        {selectedTeam && <Button variant="outline" onClick={() => setSelectedTeam(null)}>Back to List</Button>}
      </div>

      {!selectedTeam ? (
        <Card className="dash-section-card">
          {teams.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No teams allocated yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table" style={{ width: '100%', minWidth: '600px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem' }}>Team Name</th>
                    <th style={{ padding: '1rem' }}>Code</th>
                    <th style={{ padding: '1rem' }}>Leader</th>
                    <th style={{ padding: '1rem' }}>Members</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t, i) => (
                    <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{t.team_name}</td>
                      <td style={{ padding: '1rem' }}>{t.team_code}</td>
                      <td style={{ padding: '1rem' }}>{t.leader_name}</td>
                      <td style={{ padding: '1rem' }}>{t.member_count}</td>
                      <td style={{ padding: '1rem' }}><span className={`status-badge ${t.status?.toLowerCase().replace(' ', '-')}`}>{t.status}</span></td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <Button variant="outline" size="sm" onClick={() => handleView(t.id)}>View Details</Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              {selectedTeam.team_name} ({selectedTeam.team_code})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ marginBottom: '1rem' }}>Team Details</h3>
                <p><strong>Department:</strong> {selectedTeam.department_name}</p>
                <p><strong>Academic Year:</strong> {selectedTeam.academic_year}</p>
                <p><strong>Status:</strong> {selectedTeam.status}</p>
              </div>
              <div>
                <h3 style={{ marginBottom: '1rem' }}>Members</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {(selectedTeam.members_details || []).map(m => (
                    <li key={m.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'var(--background)', borderRadius: '4px' }}>
                      <strong>{m.full_name}</strong> {m.id === selectedTeam.leader ? '(Leader)' : ''} <br/>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{m.email}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default GuideStudents;
