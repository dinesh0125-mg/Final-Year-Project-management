import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import { reviewAPI } from '../../api/api';
import './StudentDashboard.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewAPI.list().then((res) => {
      const data = res.data?.data;
      setReviews(Array.isArray(data) ? data : (data?.results || []));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard-page"><p>Loading reviews...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet>
        <title>Reviews - ProjectHub</title>
      </Helmet>
      
      <div className="dashboard-header-text">
        <h1>Feedback & Reviews</h1>
        <p>Review comments and grades from your project guide and panel.</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        {reviews.length === 0 ? (
          <Card style={{ padding: '3rem', textAlign: 'center' }}>
            <h3>No Reviews Yet</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You have no reviews from guides or panel members.</p>
          </Card>
        ) : (
          reviews.map((review, idx) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card style={{ padding: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{review.review_type}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Reviewed on {new Date(review.created_at).toLocaleDateString()} by {review.reviewer_name || 'Reviewer'}</p>
                  </div>
                  <div>
                    <span className="milestone-badge completed">Rating: {review.rating}/5</span>
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Comments:</h4>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>"{review.feedback}"</p>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;
