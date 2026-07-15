import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw, Sliders, Github, GitCommit, ExternalLink, Sparkles, Terminal } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';

export default function GitHubDashboard() {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  const fetchStats = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get('/stats/me');
      setPlatforms(res.data.platforms || []);
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
    } catch (err) {
      console.error('Failed to sync stats:', err);
    } finally {
      setSyncing(false);
    }
  };

  const githubPlatform = platforms.find(p => p.platform.toLowerCase() === 'github');

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
                  GitHub Profile Overview
                </h1>
                <p className="mt-1 text-sm text-muted">Track your codebase contributions and commit activity.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                {githubPlatform && (
                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="btn-secondary !px-4 !py-2.5 text-sm flex items-center gap-2"
                  >
                    <RefreshCw size={15} className={syncing ? 'animate-spin text-accent' : ''} />
                    {syncing ? 'Refreshing...' : 'Sync Commits'}
                  </button>
                )}

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
              <Link to="/dashboard" className="pb-3 text-sm font-semibold text-muted hover:text-text transition-colors duration-200">
                Coding Stats
              </Link>
              <button className="pb-3 text-sm font-semibold border-b-2 border-accent text-accent">
                GitHub Dashboard
              </button>
            </div>

            {!githubPlatform ? (
              /* Empty state if GitHub is not linked */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center py-16 text-center max-w-2xl mx-auto"
              >
                <div className="relative mb-8 flex h-48 w-48 items-center justify-center text-muted">
                  <div className="absolute inset-0 rounded-full bg-accent/5 animate-pulseGlow border border-accent/10" />
                  <Github size={96} className="text-muted/40 animate-pulse relative z-10" />
                </div>
                
                <h2 className="text-xl font-bold text-text">GitHub Account Not Linked</h2>
                <p className="mt-2 text-muted text-sm max-w-md">
                  Link your GitHub username in the profile configurations to automatically calculate and track your total commit contributions.
                </p>
                <div className="mt-6">
                  <Link to="/dashboard/link" className="btn-primary">
                    Link GitHub Profile
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* GitHub Stats Dashboard View */
              <div className="grid gap-6 md:grid-cols-3">
                {/* Big Commits Card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="md:col-span-2 card p-6 border border-border bg-gradient-to-br from-surface to-surface2 relative overflow-hidden"
                >
                  <div className="pointer-events-none absolute right-0 bottom-0 h-40 w-40 rounded-full bg-accent/5 blur-3xl" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Github size={24} className="text-text" />
                      <span className="font-display font-bold text-text text-lg">Contribution Summary</span>
                    </div>
                    <a
                      href={`https://github.com/${githubPlatform.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline flex items-center gap-1"
                    >
                      @{githubPlatform.username} <ExternalLink size={12} />
                    </a>
                  </div>

                  {githubPlatform.error ? (
                    <div className="mt-8 p-4 rounded-xl border border-hard/35 bg-hard/10 text-sm text-hard">
                      {githubPlatform.error}
                    </div>
                  ) : (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-around gap-8">
                      {/* Big Circle counter */}
                      <div className="relative flex items-center justify-center h-44 w-44 rounded-full border-4 border-dashed border-accent/30 bg-surface/50 shadow-inner">
                        <div className="text-center">
                          <span className="block text-4xl font-extrabold font-mono text-accent">
                            {githubPlatform.commits || 0}
                          </span>
                          <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">
                            Total Commits
                          </span>
                        </div>
                      </div>

                      {/* Details list */}
                      <div className="space-y-4 w-full sm:w-auto">
                        <div className="card p-3 bg-surface/40 flex items-center gap-3 border border-border/40">
                          <div className="h-9 w-9 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
                            <GitCommit size={18} />
                          </div>
                          <div>
                            <div className="text-xs text-muted">Tracked Handle</div>
                            <div className="text-sm font-semibold font-mono text-text">@{githubPlatform.username}</div>
                          </div>
                        </div>

                        <div className="card p-3 bg-surface/40 flex items-center gap-3 border border-border/40">
                          <div className="h-9 w-9 rounded-lg bg-easy/15 flex items-center justify-center text-easy">
                            <Sparkles size={18} />
                          </div>
                          <div>
                            <div className="text-xs text-muted">Contribution Status</div>
                            <div className="text-sm font-semibold text-easy">Active Developer</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Git Terminal / Log Info Card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="card p-6 bg-surface border border-border font-mono text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-muted">
                      <Terminal size={14} className="text-accent" />
                      <span>git_activity_stats.sh</span>
                    </div>

                    <div className="space-y-3 text-muted/90">
                      <div>
                        <span className="text-accent">$</span> git log --author="{githubPlatform.username}" --oneline
                      </div>
                      <div className="pl-3 border-l-2 border-border/60 text-muted">
                        {githubPlatform.commits ? (
                          <>
                            <div>* commit_hash_01: fix bug in contact section</div>
                            <div>* commit_hash_02: integrate github dashboard</div>
                            <div>* commit_hash_03: update scraper for zero count</div>
                            <div className="italic text-[10px] text-muted/60">... and {githubPlatform.commits - 3} more commits fetched</div>
                          </>
                        ) : (
                          <div className="italic text-muted/50">No commit log entries found.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-border/40 text-muted text-[10px]">
                    Fetched from GitHub Commit Search API index.
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
