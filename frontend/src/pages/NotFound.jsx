import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Compass, GitMerge } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl px-4 py-24 flex-grow flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="card p-10 max-w-lg border border-border/80 shadow-2xl relative overflow-hidden"
        >
          {/* Ambient decorative glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-accent2/15 blur-3xl" />

          <div className="relative z-10 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/25 shadow-sm">
              <Compass size={32} className="animate-spin" style={{ animationDuration: '10s' }} />
            </div>

            <h1 className="font-mono text-6xl font-extrabold text-text">404</h1>
            <h2 className="font-display text-xl font-bold text-text">Page Not Found</h2>
            <p className="text-sm text-muted">
              The page you're looking for might have been moved, renamed, or doesn't exist.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link to="/dashboard" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                <Home size={16} />
                <span>Go to Dashboard</span>
              </Link>
              <Link to="/" className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2">
                <ArrowLeft size={16} />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

