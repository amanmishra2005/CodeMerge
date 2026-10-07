import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const meta = {
  leetcode: { label: 'LeetCode', color: '#FFB454' },
  codeforces: { label: 'Codeforces', color: '#4C8DFF' },
  gfg: { label: 'GeeksforGeeks', color: '#3DDC84' },
  geeksforgeeks: { label: 'GeeksforGeeks', color: '#3DDC84' },
  hackerrank: { label: 'HackerRank', color: '#FF5C5C' },
  codechef: { label: 'CodeChef', color: '#F7931E' },
  atcoder: { label: 'AtCoder', color: '#808080' },
};

function normalizeKey(str) {
  if (!str) return '';
  const clean = str.toLowerCase().replace(/[\s\-_]/g, '');
  if (clean === 'geeksforgeek') return 'gfg';
  return clean;
}

export default function PlatformCard({ platform, delay }) {
  const platformKey = normalizeKey(platform.platform);
  const m = meta[platformKey] || { label: platform.platform, color: '#8B96AD' };

  const easy = Number(platform.easy) || 0;
  const medium = Number(platform.medium) || 0;
  const hard = Number(platform.hard) || 0;
  const totalSolved = Math.max(Number(platform.totalSolved) || 0, easy + medium + hard);

  const hasStats = totalSolved > 0;

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
          <span className="font-display font-semibold text-text">
            {platform.label ? `${m.label} (${platform.label})` : m.label}
          </span>
        </div>
        <span className="font-mono text-xs text-muted">@{platform.username}</span>
      </div>

      {platform.error && !hasStats ? (
        <div className="mt-4 flex items-start gap-2 text-sm text-accent2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{platform.error}</span>
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="font-mono text-2xl font-bold text-text">{totalSolved}</div>
            {platform.error && (
              <span className="text-[10px] text-accent2 flex items-center gap-1 font-mono">
                <AlertTriangle size={11} /> cached
              </span>
            )}
          </div>
          <div className="text-xs text-muted">total solved</div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-mono text-sm font-semibold text-easy">{easy}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted">Easy</div>
            </div>
            <div>
              <div className="font-mono text-sm font-semibold text-medium">{medium}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted">Medium</div>
            </div>
            <div>
              <div className="font-mono text-sm font-semibold text-hard">{hard}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted">Hard</div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
