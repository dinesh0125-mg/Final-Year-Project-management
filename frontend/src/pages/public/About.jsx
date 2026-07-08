import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import './PublicPages.css';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - ProjectHub</title>
      </Helmet>
      
      <Navbar />
      
      <main className="public-page-main">
        <section className="page-header">
          <div className="container">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }}
            >
              About ProjectHub
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Our mission is to streamline academic project management for engineering colleges globally.
            </motion.p>
          </div>
        </section>

        <section className="container section-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'center' }}
          >
            <div style={{ flex: '1 1 400px' }}>
              <img 
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800" 
                alt="Team working together" 
                style={{ width: '100%', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)' }}
              />
            </div>
            <div style={{ flex: '1 1 400px' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Bridging the Gap in Academia</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.8' }}>
                ProjectHub was born out of a simple observation: managing final year projects across multiple departments is a chaotic mix of spreadsheets, lost emails, and missed deadlines.
              </p>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                We built a platform that brings students, guides, and HODs onto a single, unified interface. We focus on clear milestones, transparent feedback, and actionable insights to make sure every project succeeds.
              </p>
            </div>
          </motion.div>
        </section>
      </main>
    </>
  );
};

export default About;
