import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Star, Trophy } from 'lucide-react';

const meta = {
  leetcode: { label: 'LeetCode', color: '#FFB454' },
  codeforces: { label: 'Codeforces', color: '#4C8DFF' },
  gfg: { label: 'GeeksforGeeks', color: '#3DDC84' },
  geeksforgeeks: { label: 'GeeksforGeeks', color: '#3DDC84' },
  hackerrank: { label: 'HackerRank', color: '#FF5C5C' },
  codechef: { label: 'CodeChef', color: '#F7931E' },
  atcoder: { label: 'AtCoder', color: '#808080' },
  github: { label: 'GitHub', color: '#58A6FF' },
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

  const isGH = platformKey === 'github';
  const easy = Number(platform.easy) || 0;
  const medium = Number(platform.medium) || 0;
  const hard = Number(platform.hard) || 0;
  const totalSolved = isGH ? 0 : Math.max(Number(platform.totalSolved) || 0, easy + medium + hard);

  const hasStats = isGH ? Number(platform.commits) > 0 : totalSolved > 0;

  // Extra quick stat label (rating, stars, commits)
  let extraBadge = null;
  if (isGH && platform.commits !== undefined) {
    extraBadge = `${platform.commits} commits`;
  } else if (platformKey === 'codeforces' && platform.rating) {
    extraBadge = `${platform.rating} rating`;
  } else if (platformKey === 'codechef' && platform.stars) {
    extraBadge = platform.stars;
  } else if (platformKey === 'gfg' && platform.codingScore) {
    extraBadge = `${platform.codingScore} pts`;
  } else if (platformKey === 'leetcode' && platform.contest?.rating) {
    extraBadge = `${platform.contest.rating} contest`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="card p-5 group hover:border-accent/50 hover:shadow-[0_0_20px_rgba(76,141,255,0.12)] transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
            <span className="font-display font-semibold text-text group-hover:text-accent transition-colors">
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
        ) : isGH ? (
          <>
            <div className="mt-4 flex items-baseline justify-between">
              <div className="font-mono text-2xl font-bold text-accent">{platform.commits || 0}</div>
              <span className="text-xs text-muted font-mono">commits</span>
            </div>
            <div className="text-xs text-muted">GitHub code activity</div>
          </>
        ) : (
          <>
            <div className="mt-4 flex items-baseline justify-between">
              <div className="font-mono text-2xl font-bold text-text">{totalSolved}</div>
              {extraBadge ? (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-surface2 text-accent border border-border/50">
                  {extraBadge}
                </span>
              ) : platform.error ? (
                <span className="text-[10px] text-accent2 flex items-center gap-1 font-mono">
                  <AlertTriangle size={11} /> cached
                </span>
              ) : null}
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
      </div>

      {/* Direct link to Platform Dashboard */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
        <Link
          to={`/dashboard/platform/${platformKey}`}
          className="text-xs font-semibold text-accent group-hover:text-accent hover:underline flex items-center gap-1 w-full justify-between"
        >
          <span>Open Dashboard</span>
          <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
