import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PlatformLinker from '../components/dashboard/PlatformLinker.jsx';
import StatsOverview from '../components/dashboard/StatsOverview.jsx';
import DifficultyChart from '../components/dashboard/DifficultyChart.jsx';
import PlatformCard from '../components/dashboard/PlatformCard.jsx';
import AIFeedback from '../components/dashboard/AIFeedback.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState([]);
  const [totals, setTotals] = useState({ totalSolved: 0, easy: 0, medium: 0, hard: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/stats/me')
      .then((res) => {
        setPlatforms(res.data.platforms || []);
        setTotals(res.data.totals || {});
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (data) => {
    setPlatforms(data.platforms || []);
    setTotals(data.totals || {});
  };

  const hasStats = platforms.length > 0;

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-text md:text-3xl">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-muted">Here's everything merged into one view.</p>
        </motion.div>

        <div className="mt-8 space-y-8">
          <PlatformLinker initialPlatforms={user?.platforms} onSaved={handleSaved} />

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent" />
            </div>
          ) : (
            <>
              <StatsOverview totals={totals} />
              <DifficultyChart platforms={platforms} totals={totals} />

              {hasStats && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {platforms.map((p, i) => (
                    <PlatformCard key={p.platform} platform={p} delay={i * 0.08} />
                  ))}
                </div>
              )}

              <AIFeedback hasStats={hasStats} />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
