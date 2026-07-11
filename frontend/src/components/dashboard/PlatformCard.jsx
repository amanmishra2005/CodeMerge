import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const meta = {
  leetcode: { label: 'LeetCode', color: '#FFB454' },
  codeforces: { label: 'Codeforces', color: '#4C8DFF' },
  gfg: { label: 'GeeksforGeeks', color: '#3DDC84' },
  hackerrank: { label: 'HackerRank', color: '#FF5C5C' },
};

export default function PlatformCard({ platform, delay }) {
  const m = meta[platform.platform] || { label: platform.platform, color: '#8B96AD' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="card p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
          <span className="font-display font-semibold text-text">{m.label}</span>
        </div>
        <span className="font-mono text-xs text-muted">@{platform.username}</span>
      </div>

      {platform.error ? (
        <div className="mt-4 flex items-start gap-2 text-sm text-accent2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{platform.error}</span>
        </div>
      ) : (
        <>
          <div className="mt-4 font-mono text-2xl font-bold text-text">{platform.totalSolved}</div>
          <div className="text-xs text-muted">total solved</div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-mono text-sm font-semibold text-easy">{platform.easy}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted">Easy</div>
            </div>
            <div>
              <div className="font-mono text-sm font-semibold text-medium">{platform.medium}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted">Medium</div>
            </div>
            <div>
              <div className="font-mono text-sm font-semibold text-hard">{platform.hard}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted">Hard</div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
