import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/common/Card';
import './PublicPages.css';
import { FiCheckCircle, FiUsers, FiFlag, FiFileText, FiCalendar, FiMessageSquare, FiShield, FiTrendingUp } from 'react-icons/fi';

const allFeatures = [
  { icon: <FiCheckCircle />, title: 'Project Tracking', desc: 'Track progress, tasks and overall project completion in real-time with granular visibility.' },
  { icon: <FiUsers />, title: 'Guide Allocation', desc: 'Allocate guides to students and manage allocations efficiently with an intelligent matching system.' },
  { icon: <FiFlag />, title: 'Milestone Management', desc: 'Create, track and manage milestones to ensure timely project delivery.' },
  { icon: <FiFileText />, title: 'Document Submission', desc: 'Upload, organize, and manage all project documents securely in one centralized repository.' },
  { icon: <FiCalendar />, title: 'Meeting Scheduler', desc: 'Schedule meetings, reviews, and viva sessions with ease using the integrated calendar.' },
  { icon: <FiMessageSquare />, title: 'Review Feedback', desc: 'Provide structured feedback and track improvements through continuous review cycles.' },
  { icon: <FiShield />, title: 'Secure Authentication', desc: 'Role-based access control ensuring students, guides, and admins only see what they should.' },
  { icon: <FiTrendingUp />, title: 'Advanced Analytics', desc: 'Generate reports and view real-time department analytics on project performance.' }
];

const Features = () => {
  return (
    <>
      <Helmet>
        <title>Features - ProjectHub</title>
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
              Platform Features
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Everything you need to manage Final Year Projects from proposal to presentation.
            </motion.p>
          </div>
        </section>

        <section className="container section-padding">
          <div className="features-grid">
            {allFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-desc">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Features;
