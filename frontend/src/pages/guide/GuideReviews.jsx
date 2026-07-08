import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { reviewAPI, projectAPI } from '../../api/api';
import './GuideDashboard.css';
import { FiX } from 'react-icons/fi';

const GuideReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [editReviewId, setEditReviewId] = useState(null);
  
  const [formData, setFormData] = useState({
    project: '',
    review_type: 'PROGRESS',
    feedback: '',
    rating: '5',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const revRes = await reviewAPI.list();
      const revs = Array.isArray(revRes.data?.data) ? revRes.data.data : (revRes.data?.data?.results || []);
      setReviews(revs);

      const projRes = await projectAPI.list();
      const projs = Array.isArray(projRes.data?.data) ? projRes.data.data : (projRes.data?.data?.results || []);
      setProjects(projs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.project) {
      setError('Please select a project to review.');
      return;
    }
    
    setSubmitting(true);
    try {
      if (editReviewId) {
        await reviewAPI.update(editReviewId, formData);
      } else {
        await reviewAPI.create(formData);
      }
      setShowAdd(false);
      setEditReviewId(null);
      setFormData({ project: '', review_type: 'PROGRESS', feedback: '', rating: '5' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditReviewId(review.id);
    setFormData({
      project: review.project,
      review_type: review.review_type,
      feedback: review.feedback,
      rating: review.rating,
    });
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProposalReview = async (action) => {
    setError('');
    setSubmitting(true);
    try {
      // 1. Submit the review comment/rating if provided
      if (formData.feedback) {
        await reviewAPI.create({
            project: selectedProposal.id,
            review_type: 'PROPOSAL',
            feedback: formData.feedback,
            rating: formData.rating
        });
      }
      
      // 2. Change project status
      await projectAPI.review(selectedProposal.id, {
        action: action,
        feedback: formData.feedback
      });

      setSelectedProposal(null);
      setFormData({ project: '', review_type: 'PROGRESS', feedback: '', rating: '5' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingProposals = projects.filter(p => p.status === 'SUBMITTED');

  if (loading) return <div className="dashboard-page"><p>Loading reviews...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet><title>Reviews - ProjectHub</title></Helmet>
      <div className="dashboard-header-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Reviews & Feedback</h1>
          <p>Provide feedback and evaluate project progress.</p>
        </div>
        <Button variant="primary" onClick={() => {
          setEditReviewId(null);
          setFormData({ project: '', review_type: 'PROGRESS', feedback: '', rating: '5' });
          setShowAdd(!showAdd);
        }}>
          {showAdd ? 'Close Form' : 'Write General Review'}
        </Button>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{editReviewId ? 'Edit Review' : 'Submit New General Review'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div className="input-group">
                <label className="input-label">Project</label>
                <select className="input-field" value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} required>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.team_name})</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Review Type</label>
                <select className="input-field" value={formData.review_type} onChange={e => setFormData({...formData, review_type: e.target.value})} required>
                  <option value="MILESTONE">Milestone Review</option>
                  <option value="DOCUMENT">Document Review</option>
                  <option value="PROGRESS">Progress Review</option>
                  <option value="FINAL">Final Review</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Rating (1-5)</label>
                <input type="number" min="1" max="5" className="input-field" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} required />
              </div>
              
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Feedback Comments</label>
                <textarea className="input-field" rows="4" value={formData.feedback} onChange={e => setFormData({...formData, feedback: e.target.value})} required></textarea>
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editReviewId ? 'Save Changes' : 'Submit Review')}
                </Button>
                {editReviewId && (
                  <Button type="button" variant="outline" onClick={() => {
                    setEditReviewId(null);
                    setShowAdd(false);
                  }}>Cancel</Button>
                )}
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {selectedProposal && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card style={{ padding: '2rem', marginBottom: '1.5rem', border: '2px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Review Proposal: {selectedProposal.title}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Team: {selectedProposal.team_name} | Domain: {selectedProposal.domain}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedProposal(null)}><FiX /></Button>
            </div>
            
            <div style={{ marginTop: '1.5rem', background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h4>Abstract</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{selectedProposal.abstract}</p>
                
                <h4>Technology</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{selectedProposal.technology}</p>
                
                <h4>Problem Statement</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{selectedProposal.problem_statement}</p>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                <div className="input-group">
                    <label className="input-label">Rating (1-5)</label>
                    <input type="number" min="1" max="5" className="input-field" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
                </div>
                <div className="input-group" style={{ marginTop: '1rem' }}>
                    <label className="input-label">Feedback Comments</label>
                    <textarea className="input-field" rows="3" value={formData.feedback} onChange={e => setFormData({...formData, feedback: e.target.value})} placeholder="Add remarks or required changes..."></textarea>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <Button variant="primary" onClick={() => handleProposalReview('APPROVE')} disabled={submitting}>Approve</Button>
                <Button variant="outline" onClick={() => handleProposalReview('REQUEST_CHANGES')} disabled={submitting}>Request Changes</Button>
                <Button variant="outline" onClick={() => handleProposalReview('REJECT')} style={{ borderColor: 'var(--error)', color: 'var(--error)' }} disabled={submitting}>Reject</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {pendingProposals.length > 0 && !selectedProposal && (
        <Card className="dash-section-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--warning)' }}>Pending Proposals ({pendingProposals.length})</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {pendingProposals.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                        <h4 style={{ margin: 0 }}>{p.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Team: {p.team_name} • Domain: {p.domain}</p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setSelectedProposal(p)}>Review</Button>
                </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="dash-section-card">
        <h3 style={{ marginBottom: '1rem' }}>Review History</h3>
        {reviews.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No reviews written yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table" style={{ width: '100%', minWidth: '600px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Project</th>
                  <th style={{ padding: '1rem' }}>Review Type</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Rating</th>
                  <th style={{ padding: '1rem' }}>Feedback Snippet</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{r.project_title}</td>
                    <td style={{ padding: '1rem' }}>{r.review_type}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{r.rating}/5</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.feedback}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Button variant="outline" size="sm" onClick={() => handleEditReview(r)}>Edit</Button>
                    </td>
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

export default GuideReviews; 
