import React from 'react';
import { motion } from 'framer-motion';
import './ContactForm.css';

const ContactForm = () => {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully!");
    window.location.reload();
  };

  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="contact-grid">
          <motion.div 
            className="contact-info"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="contact-title">YOUR LIFE, SIMULATED!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '400px', lineHeight: '1.6' }}>
              Contact our team to learn more about how Flowstate can transform your future through guided intent and real-time guidance.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>General Inquiries</p>
              <a href="mailto:hello@flowstate.ai" style={{ fontSize: '1.125rem', color: 'var(--link-color)' }}>hello@flowstate.ai</a>
            </div>
          </motion.div>

          <motion.div 
            className="contact-form-container"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input className="form-input" type="text" id="name" placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input className="form-input" type="email" id="email" placeholder="john@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="focus">Project Focus</label>
                <select className="form-select" id="focus" required>
                  <option value="">Select an option</option>
                  <option value="productivity">Personal Productivity</option>
                  <option value="business">Business Growth</option>
                  <option value="health">Health & Wellness</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea className="form-textarea" id="message" placeholder="How can we help you stay in flow?" required></textarea>
              </div>
              <button className="btn-primary" type="submit">Send Message</button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
