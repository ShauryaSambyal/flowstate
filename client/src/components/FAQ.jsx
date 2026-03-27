import { motion, AnimatePresence } from 'framer-motion';
import './FAQ.css';
import { useState } from 'react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`faq-item ${isOpen ? 'active' : ''}`}>
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        <span>{question}</span>
        <motion.div 
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="faq-icon"
        >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="faq-answer"
          >
            <div style={{ paddingBottom: '1.5rem' }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "What is Flowstate?",
      answer: "Flowstate is an AI-powered life OS that helps you shape habits, predict outcomes, and stay in a state of high performance through guided intent and real-time guidance."
    },
    {
      question: "How does the intent recognition work?",
      answer: "Our AI analyzes your historical patterns, calendar, and current context to recognize what you're trying to achieve and proactively suggests the most effective next steps."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use end-to-end encryption for all personal data. Your progress and inputs are yours alone and are never sold or used for external training without explicit consent."
    },
    {
      question: "Can I use it for my team?",
      answer: "Yes, Flowstate has a multi-user workspace feature that allows teams to align their collective intent while maintaining individual flow states."
    }
  ];

  return (
    <section className="faq" id="support">
      <div className="container">
        <div className="faq-header">
          <motion.h2 
            className="faq-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Got Questions?
          </motion.h2>
          <p style={{ color: 'var(--text-secondary)' }}>Everything you need to know about the Flowstate platform.</p>
        </div>

        <div className="faq-container">
          {faqs.map((faq, index) => (
            <FAQItem key={index} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
