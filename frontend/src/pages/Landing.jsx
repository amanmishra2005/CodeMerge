import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Hero from '../components/landing/Hero.jsx';
import Features from '../components/landing/Features.jsx';
import HowItWorks from '../components/landing/HowItWorks.jsx';
import Contact from '../components/landing/Contact.jsx';

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
