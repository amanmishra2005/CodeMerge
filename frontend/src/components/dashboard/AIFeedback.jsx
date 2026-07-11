import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import api from '../../api/axios.js';

export default function AIFeedback({ hasStats }) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/feedback/analyze');
      setFeedback(res.data.feedback);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate feedback right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card relative overflow-hidden p-6"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-2xl" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Sparkles size={18} />
          </span>
          <h3 className="font-display text-lg font-semibold text-text">AI profile feedback</h3>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || !hasStats}
          className="btn-primary !px-4 !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={16} /> Analyze my profile
            </>
          )}
        </button>
      </div>

      {!hasStats && (
        <p className="mt-4 text-sm text-muted">
          Link a platform and refresh your stats first so Gemini has something to analyze.
        </p>
      )}

      {error && <p className="mt-4 text-sm text-hard">{error}</p>}

      <AnimatePresence>
        {feedback && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 whitespace-pre-line rounded-xl border border-border bg-surface2 p-4 text-sm leading-relaxed text-text"
          >
            {feedback}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
