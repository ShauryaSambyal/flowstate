import React from 'react';
import { motion } from 'framer-motion';
import './Gallery.css';

const Gallery = () => {
  const items = [
    { title: "Personal Life", tag: "Strategy", image: "/Empty_chair_in_202603272305.jpeg" },
    { title: "Productivity", tag: "Action", image: "/Deadlines_in_phone_202603272312.jpeg" },
    { title: "Health & Fitness", tag: "Balance", image: "/Guided_action_feed_202603272321.jpeg" },
    { title: "Career Growth", tag: "Vision", image: "/Career_growth_realistic_202603280954.jpeg" },
    { title: "Financial Freedom", tag: "Security", image: "/Financial_freedom_comedic_202603280956.jpeg" },
    { title: "Deep Work", tag: "Focus", image: "/download.png" }
  ];

  return (
    <section className="gallery" id="gallery">
      <div className="container">
        <div className="gallery-header">
          <motion.h2 
            className="gallery-title"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Workflow Gallery
          </motion.h2>
          <motion.p 
            className="gallery-description"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ color: 'var(--text-inverse-secondary)', maxWidth: '600px', margin: '0 auto' }}
          >
            Explore real examples of how AI transforms lives through focused intent and guided action.
          </motion.p>
        </div>

        <div className="gallery-grid">
          {items.map((item, index) => (
            <motion.div 
              key={index}
              className="gallery-item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <img src={item.image} alt={item.title} className="gallery-item-image" />
              <div className="gallery-item-content">
                <span className="gallery-item-tag">{item.tag}</span>
                <h3 className="gallery-item-title">{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
