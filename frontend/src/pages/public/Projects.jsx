import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Card from '../../components/common/Card';
import './PublicPages.css';

const pastProjects = [
  { title: 'AI Traffic Optimization', dept: 'Computer Science', desc: 'A machine learning system to optimize traffic lights in real-time.', img: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=400&h=300' },
  { title: 'Smart Grid IoT', dept: 'Electrical', desc: 'IoT based power distribution and monitoring system for smart cities.', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400&h=300' },
  { title: 'Autonomous Drone', dept: 'Robotics', desc: 'Autonomous drone for agricultural survey and crop health analysis.', img: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=400&h=300' },
  { title: 'Blockchain Voting', dept: 'Information Tech', desc: 'Secure and transparent e-voting system utilizing blockchain.', img: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=400&h=300' }
];

const Projects = () => {
  return (
    <>
      <Helmet>
        <title>Projects - ProjectHub</title>
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
              Discover Projects
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Explore innovative final year projects developed by our engineering students.
            </motion.p>
          </div>
        </section>

        <section className="container section-padding">
          <div className="projects-grid">
            {pastProjects.map((proj, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover className="project-card">
                  <div className="card-img-wrapper">
                    <img src={proj.img} alt={proj.title} className="card-img" />
                  </div>
                  <div className="card-content">
                    <h3>{proj.title}</h3>
                    <span className="card-subtitle">{proj.dept}</span>
                    <p className="card-desc">{proj.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default Projects;
