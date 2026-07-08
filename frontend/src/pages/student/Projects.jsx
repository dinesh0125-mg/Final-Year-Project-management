import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { projectAPI, teamAPI } from '../../api/api';
import './StudentDashboard.css';

const Projects = () => {
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPropose, setShowPropose] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    domain: '',
    technology: '',
    objectives: '',
    problem_statement: '',
    expected_outcome: ''
  });
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const teamRes = await teamAPI.myTeam();
      const myTeam = teamRes.data?.data;
      setTeam(myTeam);

      const projRes = await projectAPI.list();
      const projs = Array.isArray(projRes.data?.data) ? projRes.data.data : (projRes.data?.data?.results || []);
      if (projs.length > 0) {
        setProject(projs[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePropose = async (e) => {
    e.preventDefault();
    setError('');
    if (!team) {
      setError("You must create or join a team first before proposing a project.");
      return;
    }
    try {
      await projectAPI.create({
        ...formData,
        team: team.id
      });
      setShowPropose(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to propose project');
    }
  };

  const handleSubmitForReview = async () => {
    try {
      await projectAPI.request('post', `/projects/${project.id}/submit/`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit project');
    }
  };

  if (loading) return <div className="dashboard-page"><p>Loading...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet>
        <title>My Project - ProjectHub</title>
      </Helmet>
      
      <div className="dashboard-header-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>My Project</h1>
          <p>Manage your assigned final year project.</p>
        </div>
        {!project && <Button variant="primary" onClick={() => setShowPropose(!showPropose)}>
          {showPropose ? 'Cancel' : '+ Propose New Project'}
        </Button>}
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {showPropose && !project && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Propose New Project</h3>
            <form onSubmit={handlePropose} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input 
                label="Project Title" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                required 
              />
              <Input 
                label="Domain (e.g. Machine Learning, Web Dev)" 
                value={formData.domain} 
                onChange={e => setFormData({...formData, domain: e.target.value})} 
                required 
              />
              <div className="input-group">
                <label className="input-label">Abstract / Description</label>
                <textarea 
                  className="input-field" 
                  rows="4" 
                  value={formData.abstract} 
                  onChange={e => setFormData({...formData, abstract: e.target.value})} 
                  required 
                ></textarea>
              </div>
              <Input 
                label="Technology (e.g. React, Django, MySQL)" 
                value={formData.technology} 
                onChange={e => setFormData({...formData, technology: e.target.value})} 
                required 
              />
              <div className="input-group">
                <label className="input-label">Objectives</label>
                <textarea 
                  className="input-field" 
                  rows="3" 
                  value={formData.objectives} 
                  onChange={e => setFormData({...formData, objectives: e.target.value})} 
                  required 
                ></textarea>
              </div>
              <div className="input-group">
                <label className="input-label">Problem Statement</label>
                <textarea 
                  className="input-field" 
                  rows="3" 
                  value={formData.problem_statement} 
                  onChange={e => setFormData({...formData, problem_statement: e.target.value})} 
                  required 
                ></textarea>
              </div>
              <div className="input-group">
                <label className="input-label">Expected Outcome</label>
                <textarea 
                  className="input-field" 
                  rows="3" 
                  value={formData.expected_outcome} 
                  onChange={e => setFormData({...formData, expected_outcome: e.target.value})} 
                  required 
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Button type="submit" variant="primary">Submit Proposal</Button>
                <Button variant="ghost" type="button" onClick={() => setShowPropose(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {!project && !showPropose && (
        <Card style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No Project Proposed Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {!team ? 'You need to form a team first.' : 'Propose a project to get started.'}
          </p>
          {!team ? (
            <Button variant="outline" onClick={() => window.location.href='/dashboard/teams'}>Go to My Team</Button>
          ) : (
            <Button variant="primary" onClick={() => setShowPropose(true)}>Propose Project</Button>
          )}
        </Card>
      )}

      {project && (
        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="project-detail-card" style={{ padding: 'var(--spacing-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{project.title}</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Domain: {project.domain}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className={`milestone-badge ${project.status?.toLowerCase().replace('_', '-')}`}>{project.status}</span>
                  </div>
                  <div>
                    <span className={`milestone-badge ${project.approval_status?.toLowerCase().replace('_', '-')}`}>{project.approval_status}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Abstract</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{project.abstract}</p>
              </div>

              <div style={{ marginBottom: '1.5rem', background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Technology</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{project.technology}</p>
              </div>

              <div style={{ marginBottom: '1.5rem', background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Problem Statement</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{project.problem_statement}</p>
              </div>
              
              <div className="progress-section" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  <span>Overall Progress</span>
                  <span>{project.progress_percentage}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${project.progress_percentage}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '4px' }}></div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="outline" onClick={() => window.location.href='/dashboard/milestones'}>View Milestones</Button>
                <Button variant="secondary" onClick={() => window.location.href='/dashboard/teams'}>Team Details</Button>
                <Button variant="outline" onClick={() => window.location.href='/dashboard/documents'}>Upload Document</Button>
                {(project.status === 'DRAFT' || project.status === 'CHANGES_REQUESTED') && (
                  <Button variant="primary" onClick={handleSubmitForReview}>Submit For Review</Button>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Projects;
