import { motion } from 'framer-motion';
import { signInWithGoogle } from '../../firebase.js';
import './Pricing.css';

const Pricing = () => {
  const plans = [
    {
      eyebrow: "Starter plan",
      price: "0 INR",
      desc: "Best for individuals",
      buttonText: "Start free",
      isPrimary: false,
      note: "No contract, cancel anytime."
    },
    {
      eyebrow: "PRO PLAN",
      price: "100 INR",
      desc: "For esteemed ones",
      buttonText: "Get Pro Access",
      isPrimary: true,
      note: "Priority support included."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <motion.div 
          className="pricing-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {plans.map((plan, index) => (
            <motion.div 
              key={index}
              className="pricing-card"
              variants={itemVariants}
            >
              <div className="pricing-eyebrow">{plan.eyebrow}</div>
              <div className="pricing-amount">{plan.price}</div>
              <p className="pricing-desc">{plan.desc}</p>
              
              <div style={{ marginTop: 'auto' }}>
                {plan.isPrimary ? (
                  <button className="btn-primary" style={{ backgroundColor: '#FFFFFF', color: '#000000' }} onClick={signInWithGoogle}>
                    {plan.buttonText}
                  </button>
                ) : (
                  <button className="btn-secondary" onClick={signInWithGoogle}>
                    {plan.buttonText}
                  </button>
                )}
                <p className="pricing-note">{plan.note}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
