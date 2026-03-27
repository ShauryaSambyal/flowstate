import React from 'react';
import { motion } from 'framer-motion';
import './Gallery.css';

const Gallery = () => {
  const items = [
    { title: "Personal Life", tag: "Strategy", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800" },
    { title: "Productivity", tag: "Action", image: "https://images.unsplash.com/photo-1554178286-db408551ba46?auto=format&fit=crop&q=80&w=800" },
    { title: "Health & Fitness", tag: "Balance", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800" },
    { title: "Career Growth", tag: "Vision", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" },
    { title: "Financial Freedom", tag: "Security", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800" },
    { title: "Deep Work", tag: "Focus", image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800" }
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
