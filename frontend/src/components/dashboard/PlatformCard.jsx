import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Star, Trophy, ExternalLink } from 'lucide-react';
import PlatformLogo from '../common/PlatformLogo.jsx';

const meta = {
  leetcode: { label: 'LeetCode', color: '#FFB454' },
  codeforces: { label: 'Codeforces', color: '#4C8DFF' },
  gfg: { label: 'GeeksforGeeks', color: '#3DDC84' },
  geeksforgeeks: { label: 'GeeksforGeeks', color: '#3DDC84' },
  hackerrank: { label: 'HackerRank', color: '#FF5C5C' },
  codechef: { label: 'CodeChef', color: '#F7931E' },
  atcoder: { label: 'AtCoder', color: '#9CA3AF' },
  github: { label: 'GitHub', color: '#58A6FF' },
};

function normalizeKey(str) {
  if (!str) return '';
  const clean = str.toLowerCase().replace(/[\s\-_]/g, '');
  if (clean === 'geeksforgeek') return 'gfg';
  return clean;
}

export default function PlatformCard({ platform, delay = 0 }) {
  const platformKey = normalizeKey(platform.platform);
  const m = meta[platformKey] || { label: platform.platform, color: '#8B96AD' };

  const isGH = platformKey === 'github';
  const easy = Number(platform.easy) || 0;
  const medium = Number(platform.medium) || 0;
  const hard = Number(platform.hard) || 0;
  const totalSolved = isGH ? 0 : Math.max(Number(platform.totalSolved) || 0, easy + medium + hard);

  const hasStats = isGH ? Number(platform.commits) > 0 : totalSolved > 0;

  // Extra quick stat label (rating, stars, commits, rank)
  let extraBadge = null;
  if (isGH && platform.commits !== undefined) {
    extraBadge = `${platform.commits} commits`;
  } else if (platformKey === 'codeforces' && platform.rating) {
    extraBadge = `${platform.rating} rating`;
  } else if (platformKey === 'codechef' && platform.stars) {
    extraBadge = platform.stars;
  } else if (platformKey === 'gfg' && (platform.codingScore || platform.score)) {
    extraBadge = `${platform.codingScore || platform.score} pts`;
  } else if (platformKey === 'leetcode' && platform.contest?.rating) {
    extraBadge = `${Math.round(platform.contest.rating)} contest`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay }}
      className="card p-5 group hover:border-accent/40 hover:shadow-[0_4px_25px_rgba(76,141,255,0.12)] transition-all duration-300 flex flex-col justify-between h-full border border-border/80 bg-surface/90"
    >
      <div>
        {/* Top Header: Official SVG Logo + Platform Name + Extra Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="p-1.5 rounded-lg border shrink-0 flex items-center justify-center bg-surface2/80"
              style={{ borderColor: `${m.color}35` }}
            >
              <PlatformLogo platform={platformKey} size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="font-display font-bold text-text text-sm sm:text-base group-hover:text-accent transition-colors truncate">
                {m.label}
              </h4>
              {platform.label && (
                <span className="text-[10px] text-muted block truncate font-mono">
                  {platform.label}
                </span>
              )}
            </div>
          </div>

          {/* Right badge if present */}
          {extraBadge && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface2 text-accent border border-border/60 shrink-0 font-semibold">
              {extraBadge}
            </span>
          )}
        </div>

        {/* Username line (spaced cleanly, never colliding) */}
        <div className="mt-2 text-xs font-mono text-muted/90 truncate flex items-center gap-1">
          <span className="text-text/50">@</span>
          <span className="truncate">{platform.username}</span>
        </div>

        {/* Metric display */}
        {platform.error && !hasStats ? (
          <div className="mt-4 flex items-start gap-2 text-xs text-accent2 bg-accent2/10 p-2.5 rounded-lg border border-accent2/20">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span className="line-clamp-2">{platform.error}</span>
          </div>
        ) : isGH ? (
          <div className="mt-4 space-y-1">
            <div className="flex items-baseline justify-between">
              <div className="font-mono text-3xl font-extrabold text-accent">
                {(platform.commits || 0).toLocaleString()}
              </div>
              <span className="text-xs text-muted font-mono font-medium">commits</span>
            </div>
            <div className="text-xs text-muted flex items-center justify-between">
              <span>GitHub code activity</span>
              {platform.publicRepos !== undefined && (
                <span className="font-mono text-[11px] text-text/80">{platform.publicRepos} repos</span>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="font-mono text-3xl font-extrabold text-text">
                {totalSolved.toLocaleString()}
              </div>
              <span className="text-xs text-muted font-mono">total solved</span>
            </div>

            {/* Easy / Med / Hard mini breakdown */}
            <div className="flex items-center gap-3 pt-1 text-xs font-mono">
              <div className="flex items-center gap-1 text-easy font-semibold">
                <span>{easy}</span>
                <span className="text-[10px] text-muted font-normal uppercase">Easy</span>
              </div>
              <div className="flex items-center gap-1 text-medium font-semibold">
                <span>{medium}</span>
                <span className="text-[10px] text-muted font-normal uppercase">Med</span>
              </div>
              <div className="flex items-center gap-1 text-hard font-semibold">
                <span>{hard}</span>
                <span className="text-[10px] text-muted font-normal uppercase">Hard</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Action footer */}
      <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
        <Link
          to={`/dashboard/platform/${platformKey}`}
          className="text-accent hover:text-accent2 font-semibold flex items-center gap-1 transition-colors"
        >
          <span>Open Dashboard</span>
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
