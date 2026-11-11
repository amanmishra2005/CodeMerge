import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GitMerge,
  Trophy,
  ExternalLink,
  Share2,
  TrendingUp,
  Sparkles,
  Award,
  Flame,
  CheckCircle2,
  ArrowRight,
  Code2,
  Sliders,
  Calendar,
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import StatsOverview from '../components/dashboard/StatsOverview.jsx';
import DifficultyChart from '../components/dashboard/DifficultyChart.jsx';
import PlatformCard from '../components/dashboard/PlatformCard.jsx';
import api from '../api/axios.js';

export default function PublicSharePage() {
  const { identifier } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSharedProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/stats/share/${identifier}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Profile not found or is currently private.');
      } finally {
        setLoading(false);
      }
    };

    if (identifier) fetchSharedProfile();
  }, [identifier]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
            <p className="text-sm text-muted">Retrieving verified developer scorecard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-ink flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-24 px-6 text-center">
          <div className="max-w-md space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-hard/15 text-hard border border-hard/30">
              <Trophy size={28} />
            </div>
            <h1 className="font-display text-2xl font-bold text-text">Scorecard Unavailable</h1>
            <p className="text-sm text-muted">{error || 'This user profile could not be located.'}</p>
            <div className="pt-2">
              <Link to="/" className="btn-primary">
                Return to Homepage
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { user, platforms = [], totals = {}, ranking = {} } = data;
  const tier = ranking.tier || { name: 'Apprentice', color: '#8B96AD', badge: '🌱' };
  const breakdown = ranking.breakdown || {};
  const codingPlatforms = platforms.filter((p) => (p.platform || '').toLowerCase().replace(/[\s\-_]/g, '') !== 'github');

  return (
    <div className="min-h-screen bg-ink flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 flex-grow space-y-8">
        {/* Verification Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-accent/25 bg-accent/5 p-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-sm">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">Verified CodeMerge Profile</span>
                <span className="rounded-full bg-easy/10 px-2 py-0.5 text-[10px] font-semibold text-easy border border-easy/30">Live Data</span>
              </div>
              <p className="text-xs text-muted">Aggregated live across competitive coding & open-source platforms</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              className="btn-secondary !py-2 !px-3.5 text-xs flex items-center gap-1.5"
            >
              <Share2 size={13} />
              <span>{copied ? 'Link Copied!' : 'Share Profile'}</span>
            </button>
            <Link to="/register" className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5">
              <span>Join CodeMerge</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Hero Scorecard */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="card relative overflow-hidden p-6 sm:p-10 border border-border shadow-2xl bg-gradient-to-br from-surface via-surface/90 to-surface2"
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: tier.color }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border shadow-sm"
                  style={{
                    backgroundColor: `${tier.color}15`,
                    borderColor: `${tier.color}45`,
                    color: tier.color,
                  }}
                >
                  <span className="text-base">{tier.badge}</span>
                  <span>{tier.name} Tier</span>
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 border border-accent/25 px-2.5 py-1 text-xs font-medium text-accent">
                  <TrendingUp size={12} />
                  <span>Top {ranking.percentile}% Worldwide</span>
                </span>
              </div>

              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-text">
                  {user.name}
                </h1>
                <p className="mt-1 text-sm text-muted">
                  Official CodeMerge Developer Scorecard
                </p>
              </div>

              <div className="flex items-baseline gap-3">
                <div className="font-mono text-5xl font-black text-text">
                  {ranking.score?.toLocaleString()}
                </div>
                <div className="text-xs uppercase font-bold text-muted">
                  MergeScore™ Points
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
              <div className="rounded-xl border border-border/80 bg-surface/90 p-4 text-center min-w-[100px]">
                <div className="text-[11px] uppercase font-semibold text-muted">Total Solved</div>
                <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-easy">
                  {totals.totalSolved?.toLocaleString() || 0}
                </div>
              </div>
              <div className="rounded-xl border border-border/80 bg-surface/90 p-4 text-center min-w-[100px]">
                <div className="text-[11px] uppercase font-semibold text-muted">Best MMR</div>
                <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-accent">
                  {breakdown.maxContestRating || 'N/A'}
                </div>
              </div>
              <div className="rounded-xl border border-border/80 bg-surface/90 p-4 text-center min-w-[100px]">
                <div className="text-[11px] uppercase font-semibold text-muted">Commits</div>
                <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-medium">
                  {breakdown.githubCommits?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Aggregated Stats Overview */}
        <StatsOverview totals={totals} />

        {/* Graphical Difficulty Breakdown & Algorithmic Radar */}
        <DifficultyChart platforms={codingPlatforms} totals={totals} ranking={ranking} />

        {/* Connected Platforms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-text">Connected Platform Profiles</h3>
            <span className="text-xs text-muted">{platforms.length} Platforms Linked</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {platforms.map((p, i) => (
              <PlatformCard key={`${p.platform}-${p.username}-${i}`} platform={p} delay={i * 0.05} />
            ))}
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-surface to-surface2 p-8 text-center space-y-4">
          <h2 className="font-display text-2xl font-bold text-text">Merge your coding presence today</h2>
          <p className="text-sm text-muted max-w-lg mx-auto">
            CodeMerge connects LeetCode, Codeforces, GitHub, GeeksforGeeks, CodeChef, HackerRank and AtCoder into one beautiful developer portfolio.
          </p>
          <div className="pt-2">
            <Link to="/register" className="btn-primary !px-6 !py-3 inline-flex items-center gap-2 font-display font-semibold">
              <Sparkles size={16} /> Get Your Free CodeMerge Rank
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

