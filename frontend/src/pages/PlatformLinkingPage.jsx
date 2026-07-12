import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Link2, Sparkles, RefreshCw, AlertCircle, ArrowLeft, Terminal, CheckCircle2, Sliders } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import api from '../api/axios.js';

const AUTO_PLATFORMS = [
  { key: 'leetcode', label: 'LeetCode', color: '#FFB454', placeholder: 'e.g. janesmith' },
  { key: 'codeforces', label: 'Codeforces', color: '#4C8DFF', placeholder: 'e.g. tourist' },
  { key: 'gfg', label: 'GeeksforGeeks', color: '#3DDC84', placeholder: 'e.g. jane_gfg' },
  { key: 'hackerrank', label: 'HackerRank', color: '#FF5C5C', placeholder: 'e.g. janesmith_hr' },
  { key: 'codechef', label: 'CodeChef', color: '#F7931E', placeholder: 'e.g. coder_cc' },
  { key: 'atcoder', label: 'AtCoder', color: '#808080', placeholder: 'e.g. tourist' },
];

const OTHER_PLATFORMS = [
  { key: 'hackerearth', label: 'HackerEarth', placeholder: 'e.g. coder_he' },
  { key: 'spoj', label: 'Spoj', placeholder: 'e.g. spoj_user' },
  { key: 'topcoder', label: 'TopCoder', placeholder: 'e.g. tc_user' },
];

const MERGING_STEPS = [
  'Finding your coding profiles...',
  'Connecting to platform servers...',
  'Fetching solved problem data...',
  'Combining difficulty rankings...',
  'Building your unified profile...',
  'All stats merged and ready!'
];

export default function PlatformLinkingPage() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Load existing platforms
  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => {
        const list = res.data.user?.platforms || [];
        if (list.length > 0) {
          setPlatforms(list.map(p => ({
            ...p,
            platform: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
            tempId: Math.random().toString()
          })));
        } else {
          // default with one empty row
          setPlatforms([{ platform: 'LeetCode', username: '', label: '', totalSolved: 0, easy: 0, medium: 0, hard: 0, tempId: Math.random().toString() }]);
        }
      })
      .catch(() => {
        setPlatforms([{ platform: 'LeetCode', username: '', label: '', totalSolved: 0, easy: 0, medium: 0, hard: 0, tempId: Math.random().toString() }]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Simulate loading steps during combine
  useEffect(() => {
    let timer;
    if (submitting) {
      if (stepIndex < MERGING_STEPS.length - 1) {
        timer = setTimeout(() => {
          setStepIndex(prev => prev + 1);
        }, 1200);
      }
    } else {
      setStepIndex(0);
    }
    return () => clearTimeout(timer);
  }, [submitting, stepIndex]);

  const handleAddRow = () => {
    setPlatforms([
      ...platforms,
      { platform: 'LeetCode', username: '', label: '', totalSolved: 0, easy: 0, medium: 0, hard: 0, tempId: Math.random().toString() },
    ]);
  };

  const handleRemoveRow = (tempId) => {
    if (platforms.length === 1) {
      setPlatforms([{ platform: 'LeetCode', username: '', label: '', totalSolved: 0, easy: 0, medium: 0, hard: 0, tempId: Math.random().toString() }]);
      return;
    }
    setPlatforms(platforms.filter((p) => p.tempId !== tempId));
  };

  const handleChangeRow = (tempId, field, value) => {
    setPlatforms(
      platforms.map((p) => (p.tempId === tempId ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const cleanList = platforms.filter((p) => p.username.trim() !== '' && p.platform.trim() !== '');
    if (cleanList.length === 0) {
      setError('Please add at least one platform name and username before combining.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Save platforms lists
      await api.put('/stats/platforms', { platforms: cleanList });

      // 2. Fetch/refresh combined stats
      await api.get('/stats/refresh');

      // Add a slight delay at the end step for effect
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Aggregation failed. Check platform names or connection.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl px-6 py-10 flex-grow relative">
        {/* Back Link */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-muted hover:text-text transition-colors duration-200"
          >
            <ArrowLeft size={16} /> Back to dashboard
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <span className="eyebrow flex items-center gap-2">
            <Sparkles size={12} /> Sync Engine
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold text-text md:text-4xl">
            Link Your Profiles
          </h1>
          <p className="mt-2 text-sm text-muted">
            Add multiple profiles across any platform. Automate syncing for supported handles, or type custom platform names and manage statistics manually.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent" />
          </div>
        ) : (
          <div className="relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 rounded-xl border border-hard/35 bg-hard/10 p-4 text-sm text-hard"
                >
                  <AlertCircle className="mt-0.5 shrink-0" size={16} />
                  <div>{error}</div>
                </motion.div>
              )}

              {/* Dynamic Profiles Rows Container */}
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {platforms.map((row, idx) => {
                    const normPlatform = (row.platform || '').toLowerCase().trim();
                    const matchedAuto = AUTO_PLATFORMS.find(ap => 
                      ap.key === normPlatform || 
                      ap.label.toLowerCase() === normPlatform
                    );
                    const isAutomated = !!matchedAuto;

                    return (
                      <motion.div
                        key={row.tempId}
                        initial={{ opacity: 0, x: -20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className="overflow-hidden animate-fade-in"
                      >
                        <div className="card p-4 sm:p-5 flex flex-col relative border border-border/80 hover:border-border/100 transition-colors duration-200">

                          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full">
                            {/* Platform Name free text input */}
                            <div className="w-full md:w-1/3">
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
                                  Platform Name
                                </label>
                                {isAutomated && (
                                  <span className="text-[10px] text-easy font-semibold flex items-center gap-1">
                                    <CheckCircle2 size={10} /> Auto-Sync
                                  </span>
                                )}
                              </div>
                              <input
                                required
                                value={row.platform}
                                onChange={(e) => handleChangeRow(row.tempId, 'platform', e.target.value)}
                                placeholder="e.g. LeetCode, GeeksforGeeks, Codeforces, CodeChef, Atcoder, HackerRank"
                                className="input-field !py-2.5 !text-sm"
                              />
                            </div>

                            {/* Username input */}
                            <div className="w-full md:w-1/3">
                              <label className="mb-1.5 block text-xs font-semibold text-muted uppercase tracking-wider">
                                Username
                              </label>
                              <input
                                required
                                value={row.username}
                                onChange={(e) => handleChangeRow(row.tempId, 'username', e.target.value)}
                                placeholder={matchedAuto ? matchedAuto.placeholder : 'e.g. developer_username'}
                                className="input-field !py-2.5 !text-sm"
                              />
                            </div>

                            {/* Optional Label input */}
                            <div className="w-full md:w-1/4">
                              <label className="mb-1.5 block text-xs font-semibold text-muted uppercase tracking-wider">
                                Profile Label <span className="text-[10px] text-muted normal-case font-normal">(optional)</span>
                              </label>
                              <input
                                value={row.label}
                                onChange={(e) => handleChangeRow(row.tempId, 'label', e.target.value)}
                                placeholder="e.g. Work, Main"
                                className="input-field !py-2.5 !text-sm"
                              />
                            </div>

                            {/* Delete row */}
                            <div className="w-full md:w-auto flex md:self-end md:pb-1 md:justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(row.tempId)}
                                className="w-full md:w-auto p-3 rounded-xl border border-border bg-surface2 text-muted hover:text-hard hover:border-hard/30 hover:bg-hard/5 transition-all duration-200 flex justify-center items-center"
                                title="Delete platform"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Manual Stats Section for Custom platforms */}
                          <AnimatePresence>
                            {!isAutomated && row.platform.trim() !== '' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full mt-4 pt-4 border-t border-border/50 grid grid-cols-4 gap-3"
                              >
                                <div className="col-span-4 text-xs font-semibold text-accent uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                  <Sliders size={12} /> Log solved statistics manually
                                </div>
                                <div>
                                  <label className="mb-1 block text-[10px] text-muted font-mono uppercase">Total</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.totalSolved || ''}
                                    onChange={(e) => handleChangeRow(row.tempId, 'totalSolved', e.target.value)}
                                    placeholder="0"
                                    className="input-field !py-2 !px-3 !text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-[10px] text-muted font-mono uppercase">Easy</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.easy || ''}
                                    onChange={(e) => handleChangeRow(row.tempId, 'easy', e.target.value)}
                                    placeholder="0"
                                    className="input-field !py-2 !px-3 !text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-[10px] text-muted font-mono uppercase">Medium</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.medium || ''}
                                    onChange={(e) => handleChangeRow(row.tempId, 'medium', e.target.value)}
                                    placeholder="0"
                                    className="input-field !py-2 !px-3 !text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-[10px] text-muted font-mono uppercase">Hard</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.hard || ''}
                                    onChange={(e) => handleChangeRow(row.tempId, 'hard', e.target.value)}
                                    placeholder="0"
                                    className="input-field !py-2 !px-3 !text-xs"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="w-full sm:w-auto btn-secondary !px-5 !py-3 flex items-center justify-center gap-2 group hover:border-accent hover:text-accent"
                >
                  <Plus size={16} className="transition-transform group-hover:rotate-90" />
                  Add platform profile
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto btn-primary !px-8 !py-3 flex items-center justify-center gap-3 relative overflow-hidden group shadow-[0_0_20px_rgba(76,141,255,0.25)]"
                >
                  <Link2 size={16} className="group-hover:rotate-12 transition-transform duration-200" />
                  Save & Combine Stats
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />

      {/* Merging Fullscreen Loader Overlay */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink/95 backdrop-blur-md px-6"
          >
            {/* Spinning Merge Centerpiece */}
            <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-dashed border-accent/20"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="absolute inset-2 rounded-full border border-dashed border-accent/40"
              />
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="absolute flex h-20 w-20 items-center justify-center rounded-2xl bg-surface border border-border shadow-[0_0_30px_rgba(76,141,255,0.15)] text-accent"
              >
                <RefreshCw size={36} className="animate-spin text-accent" />
              </motion.div>

              {/* Decorative floating orbit elements */}
              {AUTO_PLATFORMS.map((ap, i) => (
                <motion.div
                  key={ap.key}
                  animate={{
                    y: [0, -6, 0],
                    x: [0, 4, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2 + i * 0.5,
                    ease: 'easeInOut'
                  }}
                  className="absolute h-3 w-3 rounded-full shadow-[0_0_10px_currentColor]"
                  style={{
                    color: ap.color,
                    backgroundColor: ap.color,
                    top: i === 0 ? '10%' : i === 1 ? '85%' : i === 2 ? '50%' : '50%',
                    left: i === 0 ? '50%' : i === 1 ? '50%' : i === 2 ? '10%' : '85%',
                  }}
                />
              ))}
            </div>

            {/* Step Message */}
            <div className="w-full max-w-md text-center">
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="font-mono text-sm text-accent uppercase tracking-widest flex items-center justify-center gap-2 mb-2"
              >
                <Terminal size={14} /> System process
              </motion.div>
              <h2 className="font-display text-xl font-bold text-text">
                Combining Data
              </h2>
              <p className="mt-2 text-sm text-muted h-10 italic">
                {MERGING_STEPS[stepIndex]}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
