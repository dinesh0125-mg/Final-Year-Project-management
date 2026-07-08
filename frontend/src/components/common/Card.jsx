import { motion } from 'framer-motion';
import './Card.css';

const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <motion.div
      className={`card ${className}`}
      whileHover={hover ? { y: -5, boxShadow: 'var(--shadow-lg)' } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
