import React from 'react';
import { motion } from 'framer-motion';
import './Stats.css';

const Stats = () => {
  const stats = [
    { value: "10,000+", label: "Workflows structured" },
    { value: "100%", label: "Intent recognition precision" },
    { value: "300+", label: "Actions predicted daily" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.15 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="stats">
      <div className="container">
        <motion.div 
          className="stats-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {stats.map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <p className="stat-label">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Stats;
