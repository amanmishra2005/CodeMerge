import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitMerge, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Contact', href: '/#contact' },
  ];

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-border/60 bg-ink/80 backdrop-blur-lg"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-text">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <GitMerge size={20} />
          </span>
          CodeMerge
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-sm text-muted transition-colors hover:text-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-secondary !px-4 !py-2 text-sm">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-primary !px-4 !py-2 text-sm">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !px-4 !py-2 text-sm">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">
                Get started
              </Link>
            </>
          )}
        </div>

        <button className="text-text md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-border/60 px-6 py-4 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-muted" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" className="btn-secondary" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-primary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="btn-primary" onClick={() => setOpen(false)}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
