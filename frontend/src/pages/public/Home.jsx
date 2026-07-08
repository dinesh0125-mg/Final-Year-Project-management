import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import './Home.css';
import { FiCheckCircle, FiUsers, FiFlag, FiFileText, FiCalendar, FiMessageSquare } from 'react-icons/fi';

const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <title>ProjectHub - Final Year Project Management Platform</title>
        <meta name="description" content="Manage Engineering Final Year Projects Smarter with ProjectHub." />
      </Helmet>
      
      <Navbar />
      
      <main className="home-main">
        {/* Hero Section */}
        <section className="hero-section container">
          <div className="hero-content">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }}
              className="hero-title"
            >
              Manage Final Year Projects <span className="text-primary">Smarter</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hero-subtitle"
            >
              A complete platform for students, guides, HODs and admins to manage projects, milestones, documents, reviews and viva schedules.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.4 }}
              className="hero-actions"
            >
              <Button variant="primary" size="lg" onClick={() => navigate('/register')}>Get Started &rarr;</Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/features')}>Explore Features</Button>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-image-wrapper"
          >
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" 
              alt="Students collaborating" 
              className="hero-image" 
            />
          </motion.div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default Home;
