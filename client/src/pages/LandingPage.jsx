import React from 'react';
import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import BentoGrid from '../components/BentoGrid.jsx';
import Stats from '../components/Stats.jsx';
import Pricing from '../components/Pricing.jsx';
import Gallery from '../components/Gallery.jsx';
import Benefits from '../components/Benefits.jsx';
import FAQ from '../components/FAQ.jsx';
import ContactForm from '../components/ContactForm.jsx';

const LandingPage = () => {
  return (
    <>
      <Header />
      <Hero />
      <BentoGrid />
      <Stats />
      <Pricing />
      <Gallery />
      <Benefits />
      <FAQ />
      <ContactForm />
    </>
  );
};

export default LandingPage;
