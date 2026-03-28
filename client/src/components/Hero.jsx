import { motion } from 'framer-motion';
import { signInWithGoogle } from '../../firebase.js';
import './Hero.css';

const Hero = () => {
  const line1 = "Shape habits.";
  const line2 = "Predict outcomes.";

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const textToWords = (text) => text.split(" ").map(word => word + "\u00A0");

  return (
    <section className="hero">
      <div className="hero-glow"></div>
      <div className="container">
        <motion.h1 
          className="hero-title"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {textToWords(line1).map((word, index) => (
            <motion.span 
              key={index} 
              style={{ display: 'inline-block' }} 
              variants={child}
            >
              {word}
            </motion.span>
          ))}
          <br />
          {textToWords(line2).map((word, index) => (
            <motion.span 
              key={index} 
              style={{ display: 'inline-block' }} 
              variants={child}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p 
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          An AI-powered coach that helps you stay in flow, achieve your goals, 
          and simulate your future based on today's decisions.
        </motion.p>

        <motion.div 
          className="hero-actions"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.8 }}
        >
          <button className="btn-primary" onClick={signInWithGoogle}>Start free</button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
