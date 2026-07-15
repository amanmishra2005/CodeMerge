import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, RefreshCw, Sparkles, Layers, Sliders, ArrowUpRight } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import StatsOverview from '../components/dashboard/StatsOverview.jsx';
import DifficultyChart from '../components/dashboard/DifficultyChart.jsx';
import PlatformCard from '../components/dashboard/PlatformCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState([]);
  const [totals, setTotals] = useState({ totalSolved: 0, easy: 0, medium: 0, hard: 0 });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  const fetchStats = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get('/stats/me');
      setPlatforms(res.data.platforms || []);
      setTotals(res.data.totals || {});
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(true);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.get('/stats/refresh');
      setPlatforms(res.data.platforms || []);
      setTotals(res.data.totals || {});
    } catch (err) {
      console.error('Failed to sync stats:', err);
    } finally {
      setSyncing(false);
    }
  };

  const codingPlatforms = platforms.filter(p => p.platform.toLowerCase() !== 'github');
  const hasCodingStats = codingPlatforms.length > 0;

  return (
    <div className="min-h-screen bg-ink flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-6 py-10 flex-grow">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="font-display text-2xl font-bold text-text md:text-3xl">
                  Welcome back, {user?.name?.split(' ')[0]}
                </h1>
                <p className="mt-1 text-sm text-muted">Here's your aggregated developer stats.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="btn-secondary !px-4 !py-2.5 text-sm flex items-center gap-2"
                >
                  <RefreshCw size={15} className={syncing ? 'animate-spin text-accent' : ''} />
                  {syncing ? 'Refreshing...' : 'Sync Stats'}
                </button>

                <Link
                  to="/dashboard/link"
                  className="btn-primary !px-4 !py-2.5 text-sm flex items-center gap-2"
                >
                  <Sliders size={15} />
                  Configure
                </Link>
              </motion.div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border/40 gap-6">
              <button className="pb-3 text-sm font-semibold border-b-2 border-accent text-accent">
                Coding Stats
              </button>
              <Link to="/dashboard/github" className="pb-3 text-sm font-semibold text-muted hover:text-text transition-colors duration-200">
                GitHub Dashboard
              </Link>
            </div>

            {!hasCodingStats ? (
              /* Empty Coding Stats View */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center py-16 text-center max-w-2xl mx-auto"
              >
                <div className="relative mb-8 flex h-48 w-48 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-accent/5 animate-pulseGlow border border-accent/10" />
                  <svg className="w-40 h-40 relative z-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 50 H90" stroke="#26314D" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M25 20 C40 20, 45 50, 60 50" stroke="#FFB454" strokeWidth="2" />
                    <path d="M25 80 C40 80, 45 50, 60 50" stroke="#4C8DFF" strokeWidth="2" />
                    <path d="M60 50 H90" stroke="#3DDC84" strokeWidth="3" />
                    <circle cx="25" cy="20" r="5" fill="#FFB454" />
                    <circle cx="25" cy="80" r="5" fill="#4C8DFF" />
                    <circle cx="60" cy="50" r="7" fill="#131B2E" stroke="#3DDC84" strokeWidth="3" />
                    <circle cx="90" cy="50" r="6" fill="#3DDC84" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-text">Link Coding Platforms</h2>
                <p className="mt-2 text-muted text-sm max-w-md">
                  You haven't linked any coding platforms (LeetCode, Codeforces, GeeksforGeeks, HackerRank, CodeChef, AtCoder) yet. Link them to see combined problem solving statistics.
                </p>
                <div className="mt-6">
                  <Link to="/dashboard/link" className="btn-primary">
                    Link Platforms
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* Real Stats Dashboard view */
              <div className="space-y-8 animate-fade-in">
                <StatsOverview totals={totals} />
                <DifficultyChart platforms={codingPlatforms} totals={totals} />
                <div className="space-y-4">
                  <h3 className="font-display text-base font-semibold text-text">Individual accounts</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {codingPlatforms.map((p, i) => (
                      <PlatformCard key={`${p.platform}-${p.username}-${i}`} platform={p} delay={i * 0.08} />
                    ))}
                  </div>
                </div>

                {/* Dedicated AI Analysis Section CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="card relative overflow-hidden p-6 border border-accent/20 hover:border-accent/40 bg-gradient-to-r from-surface to-surface2 transition-all duration-300"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-2xl animate-pulse" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-[0_0_15px_rgba(76,141,255,0.15)]">
                        <Sparkles size={24} />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-bold text-text">AI Mentor Report</h3>
                        <p className="mt-1 text-sm text-muted max-w-xl">
                          Let our AI Mentor review your combined stats, highlight your strengths, and build a personalized roadmap showing you what to practice next.
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/dashboard/analysis"
                      className="btn-primary flex items-center justify-center gap-2 font-display font-semibold shrink-0 shadow-[0_0_20px_rgba(76,141,255,0.25)]"
                    >
                      <Sparkles size={16} /> View AI Report
                    </Link>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
