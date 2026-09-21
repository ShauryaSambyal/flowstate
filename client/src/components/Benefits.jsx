import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Benefits.css';

/* Side-by-side rows slide in from the side; stacked rows rise instead. A
   sideways offset on a stacked row pushes it past the viewport edge, which is
   the horizontal scroll this layout used to cause on phones. */
const useSideBySide = () => {
  const query = '(min-width: 769px)';
  const [wide, setWide] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia(query).matches
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = (event) => setWide(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return wide;
};

const BenefitItem = ({ tag, title, description, image, index }) => {
  const isEven = index % 2 === 0;
  const sideBySide = useSideBySide();

  const contentInitial = sideBySide
    ? { opacity: 0, x: isEven ? -50 : 50 }
    : { opacity: 0, y: 20 };

  const imageInitial = sideBySide
    ? { opacity: 0, scale: 0.9, x: isEven ? 50 : -50 }
    : { opacity: 0, scale: 0.98, y: 20 };

  return (
    <div className="benefit-item">
      <motion.div 
        className="benefit-content"
        initial={contentInitial}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <span className="benefit-tag">{tag}</span>
        <h3 className="benefit-title">{title}</h3>
        <p className="benefit-description">{description}</p>
      </motion.div>

      <motion.div 
        className="benefit-image-container"
        initial={imageInitial}
        whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
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
      tag: "Guided Action Feed",
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
