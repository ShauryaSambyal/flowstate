import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Benefits.css';

const BenefitItem = ({ tag, title, description, image, index }) => {
  const isEven = index % 2 === 0;

  return (
    <div className="benefit-item">
      <motion.div 
        className="benefit-content"
        initial={{ opacity: 0, x: isEven ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <span className="benefit-tag">{tag}</span>
        <h3 className="benefit-title">{title}</h3>
        <p className="benefit-description">{description}</p>
      </motion.div>

      <motion.div 
        className="benefit-image-container"
        initial={{ opacity: 0, scale: 0.9, x: isEven ? 50 : -50 }}
        whileInView={{ opacity: 1, scale: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <img 
          src={image} 
          alt={title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </motion.div>
    </div>
  );
};

const Benefits = () => {
  const benefits = [
    {
      tag: "Guided action feed",
      title: "Focus on what matters most.",
      description: "Our AI-powered feed filters out the noise and presents you with the most impactful actions you can take right now to stay on track.",
      image: "/Guided_action_feed_202603272321.jpeg"
    },
    {
      tag: "Intent recognition",
      title: "Anticipate your next move.",
      description: "By analyzing your patterns and current context, Flowstate recognizes your intent and prepares the tools you need before you even ask for them.",
      image: "/create_a_screen_202603272250.png"
    },
    {
      tag: "Priority insights",
      title: "Real-time performance metrics.",
      description: "Get immediate feedback on your productivity and flow state. Visualize how small changes in your routine lead to massive improvements over time.",
      image: "/Deadlines_in_phone_202603272312.jpeg"
    }
  ];

  return (
    <section className="benefits" id="about">
      <div className="container">
        {benefits.map((benefit, index) => (
          <BenefitItem key={index} {...benefit} index={index} />
        ))}
      </div>
    </section>
  );
};

export default Benefits;
