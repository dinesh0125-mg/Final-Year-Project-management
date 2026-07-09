import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { teamAPI } from '../../api/api';
import { useAuth } from '../../hooks/useAuth';
import './StudentDashboard.css';
import { FiUsers, FiCopy, FiUserPlus, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

const Teams = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [joinCode, setJoinCode] = useState('');
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editTeamName, setEditTeamName] = useState('');
  const [error, setError] = useState('');

  const fetchTeam = () => {
    teamAPI.myTeam().then(res => {
      const teamData = res.data.data;
      if (teamData && Object.keys(teamData).length > 0) {
        setTeam(teamData);
      } else {
        setTeam(null);
      }
    }).catch(() => setTeam(null)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTeam(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await teamAPI.createTeam({ team_name: teamName, academic_year: academicYear });
      setTeam(res.data.data);
      setShowCreate(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await teamAPI.join({ team_code: joinCode });
      setTeam(res.data.data);
      setShowJoin(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid team code');
    }
  };

  const copyCode = () => {
    if (team?.team_code) navigator.clipboard.writeText(team.team_code);
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        await teamAPI.removeMember(team.id, { member_id: memberId });
        fetchTeam();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to remove member');
      }
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addMemberEmail) return;
    try {
      await teamAPI.addMember(team.id, { email: addMemberEmail });
      setAddMemberEmail('');
      fetchTeam();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleUpdateTeamName = async () => {
    if (!editTeamName || editTeamName === team.team_name) {
      setIsEditingName(false);
      return;
    }
    try {
      await teamAPI.update(team.id, { team_name: editTeamName });
      setIsEditingName(false);
      fetchTeam();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update team name');
    }
  };

  if (loading) return <div className="dashboard-page"><p>Loading...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet><title>My Team - ProjectHub</title></Helmet>
      <div className="dashboard-header-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1>My Team</h1><p>Manage your project team.</p></div>
        {!team && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="primary" onClick={() => { setShowCreate(true); setShowJoin(false); }}>+ Create Team</Button>
            <Button variant="outline" onClick={() => { setShowJoin(true); setShowCreate(false); }}>Join Team</Button>
          </div>
        )}
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {showCreate && !team && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Create New Team</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}><Input label="Team Name" id="team_name" value={teamName} onChange={e => setTeamName(e.target.value)} required /></div>
              <div style={{ flex: 1, minWidth: '200px' }}><Input label="Academic Year" id="acad_year" value={academicYear} onChange={e => setAcademicYear(e.target.value)} required /></div>
              <Button type="submit" variant="primary">Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </form>
          </Card>
        </motion.div>
      )}

      {showJoin && !team && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Join Team by Code</h3>
            <form onSubmit={handleJoin} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}><Input label="Team Code" id="join_code" placeholder="e.g. AB3K9Z" value={joinCode} onChange={e => setJoinCode(e.target.value)} required /></div>
              <Button type="submit" variant="primary">Join</Button>
              <Button variant="ghost" onClick={() => setShowJoin(false)}>Cancel</Button>
            </form>
          </Card>
        </motion.div>
      )}

      {team ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {isEditingName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Input value={editTeamName} onChange={(e) => setEditTeamName(e.target.value)} style={{ margin: 0 }} />
                    <Button variant="primary" size="sm" onClick={handleUpdateTeamName}><FiCheck /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingName(false)}><FiX /></Button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{team.team_name}</h2>
                    {team.leader === user.id && (
                      <FiEdit2 style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => { setEditTeamName(team.team_name); setIsEditingName(true); }} />
                    )}
                  </div>
                )}
                <p style={{ color: 'var(--text-secondary)', margin: 0, width: '100%' }}>{team.department_name} | {team.academic_year}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'var(--background)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }} onClick={copyCode}>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1.1rem' }}>{team.team_code}</span>
                <FiCopy style={{ color: 'var(--primary)' }} />
              </div>
            </div>

            {team.guide_details && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Assigned Guide</p>
                <p style={{ fontWeight: 600 }}>{team.guide_details.full_name} — {team.guide_details.email}</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}><FiUsers style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />Members ({team.members_details?.length || 0})</h3>
              {team.leader === user.id && (
                <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '0.5rem' }}>
                  <Input placeholder="Student Email" value={addMemberEmail} onChange={e => setAddMemberEmail(e.target.value)} style={{ minWidth: '200px' }} />
                  <Button type="submit" variant="primary" size="sm" style={{ padding: '0 1rem' }}><FiUserPlus /> Add</Button>
                </form>
              )}
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {(team.members_details || []).map((member) => (
                <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{member.full_name} {member.id === team.leader ? '(Leader)' : ''}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{member.email}</p>
                  </div>
                  {team.leader === user.id && member.id !== team.leader && (
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member.id)} style={{color: 'var(--danger)'}}>
                      <FiTrash2 /> Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      ) : (
        !showCreate && !showJoin && (
          <Card style={{ padding: '3rem', textAlign: 'center' }}>
            <FiUsers size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
            <h3>No Team Yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Create a new team or join an existing one using a team code.</p>
          </Card>
        )
      )}
    </div>
  );
};

export default Teams;
