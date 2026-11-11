import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ExternalLink, GitCommit, Award, Star } from 'lucide-react';
import PlatformLogo from '../common/PlatformLogo.jsx';

const meta = {
  leetcode: { label: 'LeetCode', color: '#FFB454', bgGlow: 'rgba(255, 180, 84, 0.15)' },
  codeforces: { label: 'Codeforces', color: '#4C8DFF', bgGlow: 'rgba(76, 141, 255, 0.15)' },
  gfg: { label: 'GeeksforGeeks', color: '#3DDC84', bgGlow: 'rgba(61, 220, 132, 0.15)' },
  geeksforgeeks: { label: 'GeeksforGeeks', color: '#3DDC84', bgGlow: 'rgba(61, 220, 132, 0.15)' },
  hackerrank: { label: 'HackerRank', color: '#00EA64', bgGlow: 'rgba(0, 234, 100, 0.15)' },
  codechef: { label: 'CodeChef', color: '#F7931E', bgGlow: 'rgba(247, 147, 30, 0.15)' },
  atcoder: { label: 'AtCoder', color: '#9CA3AF', bgGlow: 'rgba(156, 163, 175, 0.15)' },
  github: { label: 'GitHub', color: '#58A6FF', bgGlow: 'rgba(88, 166, 255, 0.15)' },
};

function normalizeKey(str) {
  if (!str) return '';
  const clean = str.toLowerCase().replace(/[\s\-_]/g, '');
  if (clean === 'geeksforgeek') return 'gfg';
  return clean;
}

export default function PlatformCard({ platform, delay = 0 }) {
  const platformKey = normalizeKey(platform.platform);
  const m = meta[platformKey] || { label: platform.platform, color: '#8B96AD', bgGlow: 'rgba(139, 150, 173, 0.15)' };

  const isGH = platformKey === 'github';
  const easy = Number(platform.easy) || 0;
  const medium = Number(platform.medium) || 0;
  const hard = Number(platform.hard) || 0;
  const totalSolved = isGH ? 0 : Math.max(Number(platform.totalSolved) || 0, easy + medium + hard);

  const hasStats = isGH ? Number(platform.commits) > 0 : totalSolved > 0;

  // Extra metric badge (rating, stars, commits, rank)
  let extraBadge = null;
  if (isGH && platform.commits !== undefined) {
    extraBadge = `${platform.commits.toLocaleString()} commits`;
  } else if (platformKey === 'codeforces' && platform.rating) {
    extraBadge = `${platform.rating} rating`;
  } else if (platformKey === 'codechef' && platform.stars) {
    extraBadge = platform.stars;
  } else if (platformKey === 'gfg' && (platform.codingScore || platform.score)) {
    extraBadge = `${platform.codingScore || platform.score} pts`;
  } else if (platformKey === 'leetcode' && platform.contest?.rating) {
    extraBadge = `${Math.round(platform.contest.rating)} contest`;
  }

  // Calculate difficulty percentages for mini progress bar
  const easyPct = totalSolved > 0 ? (easy / totalSolved) * 100 : 0;
  const medPct = totalSolved > 0 ? (medium / totalSolved) * 100 : 0;
  const hardPct = totalSolved > 0 ? (hard / totalSolved) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay }}
      className="card p-5 group hover:border-accent/40 hover:shadow-[0_4px_25px_rgba(76,141,255,0.12)] transition-all duration-300 flex flex-col justify-between h-full border border-border/80 bg-surface/90 relative overflow-hidden"
    >
      {/* Subtle top-right ambient glow */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity duration-500"
        style={{ backgroundColor: m.color }}
      />

      <div className="relative z-10">
        {/* Top Header: Logo + Platform Label + Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="p-2 rounded-xl border shrink-0 flex items-center justify-center bg-surface2/90 shadow-sm transition-transform duration-300 group-hover:scale-105"
              style={{ borderColor: `${m.color}40`, backgroundColor: `${m.color}10` }}
            >
              <PlatformLogo platform={platformKey} size={20} />
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
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 font-semibold"
              style={{
                backgroundColor: `${m.color}15`,
                borderColor: `${m.color}35`,
                color: m.color,
              }}
            >
              {extraBadge}
            </span>
          )}
        </div>

        {/* Username line (spaced cleanly, dedicated row, never colliding) */}
        <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-muted/90 bg-surface2/40 px-2.5 py-1 rounded-lg border border-border/40">
          <span className="truncate flex items-center gap-1 min-w-0">
            <span className="text-accent/80 font-bold">@</span>
            <span className="truncate text-text/80">{platform.username}</span>
          </span>
          <span className="h-1.5 w-1.5 rounded-full shrink-0 ml-1.5" style={{ backgroundColor: m.color }} />
        </div>

        {/* Metric display */}
        {platform.error && !hasStats ? (
          <div className="mt-4 flex items-start gap-2 text-xs text-accent2 bg-accent2/10 p-2.5 rounded-lg border border-accent2/20">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span className="line-clamp-2">{platform.error}</span>
          </div>
        ) : isGH ? (
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="font-mono text-3xl font-extrabold text-accent tracking-tight">
                {(platform.commits || 0).toLocaleString()}
              </div>
              <span className="text-xs text-muted font-mono font-medium">commits</span>
            </div>
            <div className="text-xs text-muted flex items-center justify-between pt-1">
              <span>Public repositories</span>
              {platform.publicRepos !== undefined && (
                <span className="font-mono text-xs font-semibold text-text">{platform.publicRepos} repos</span>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-2.5">
            <div className="flex items-baseline justify-between">
              <div className="font-mono text-3xl font-extrabold text-text tracking-tight">
                {totalSolved.toLocaleString()}
              </div>
              <span className="text-xs text-muted font-mono">total solved</span>
            </div>

            {/* Stacked Mini Difficulty Bar */}
            {totalSolved > 0 && (
              <div className="h-1.5 w-full rounded-full bg-surface2 overflow-hidden flex">
                <div style={{ width: `${easyPct}%` }} className="h-full bg-easy" title={`Easy: ${easy}`} />
                <div style={{ width: `${medPct}%` }} className="h-full bg-medium" title={`Medium: ${medium}`} />
                <div style={{ width: `${hardPct}%` }} className="h-full bg-hard" title={`Hard: ${hard}`} />
              </div>
            )}

            {/* Easy / Med / Hard mini breakdown */}
            <div className="flex items-center justify-between pt-1 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-easy font-semibold">
                <span className="h-2 w-2 rounded-full bg-easy shrink-0" />
                <span>{easy}</span>
                <span className="text-[10px] text-muted font-normal uppercase hidden sm:inline">Easy</span>
              </div>
              <div className="flex items-center gap-1.5 text-medium font-semibold">
                <span className="h-2 w-2 rounded-full bg-medium shrink-0" />
                <span>{medium}</span>
                <span className="text-[10px] text-muted font-normal uppercase hidden sm:inline">Med</span>
              </div>
              <div className="flex items-center gap-1.5 text-hard font-semibold">
                <span className="h-2 w-2 rounded-full bg-hard shrink-0" />
                <span>{hard}</span>
                <span className="text-[10px] text-muted font-normal uppercase hidden sm:inline">Hard</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Action footer */}
      <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-xs relative z-10">
        <Link
          to={`/dashboard/platform/${platformKey}`}
          className="text-accent hover:text-accent2 font-semibold flex items-center gap-1.5 transition-colors group/link"
        >
          <span>Open Dashboard</span>
          <ArrowRight size={13} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
