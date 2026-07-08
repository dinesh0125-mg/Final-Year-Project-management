import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Card from '../../components/common/Card';
import './PublicPages.css';

const guides = [
  { name: 'Dr. Sarah Jenkins', dept: 'Computer Science', role: 'Professor', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300' },
  { name: 'Prof. Mark Otto', dept: 'Information Tech', role: 'HOD', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300&h=300' },
  { name: 'Dr. Emily Chen', dept: 'Electrical Eng.', role: 'Associate Prof.', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300&h=300' },
  { name: 'Dr. Robert King', dept: 'Mechanical', role: 'Professor', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=300' }
];

const Guides = () => {
  return (
    <>
      <Helmet>
        <title>Guides - ProjectHub</title>
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
              Our Expert Guides
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Meet the faculty members ready to mentor your final year project.
            </motion.p>
          </div>
        </section>

        <section className="container section-padding">
          <div className="guides-grid">
            {guides.map((guide, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover className="guide-card" style={{ alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
                  <img 
                    src={guide.img} 
                    alt={guide.name} 
                    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }} 
                  />
                  <h3 style={{ marginBottom: '0.25rem' }}>{guide.name}</h3>
                  <span className="card-subtitle" style={{ display: 'block', marginBottom: '0.25rem' }}>{guide.dept}</span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{guide.role}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default Guides;
