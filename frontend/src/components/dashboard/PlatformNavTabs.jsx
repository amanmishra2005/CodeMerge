import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Plus, Trophy } from 'lucide-react';
import PlatformLogo from '../common/PlatformLogo.jsx';

export const PLATFORM_CONFIG = {
  leetcode: {
    label: 'LeetCode',
    color: '#FFB454',
    bgLight: 'rgba(255, 180, 84, 0.12)',
    border: 'rgba(255, 180, 84, 0.35)',
    domain: 'leetcode.com',
    profileUrl: (u) => `https://leetcode.com/u/${u}/`,
  },
  codeforces: {
    label: 'Codeforces',
    color: '#4C8DFF',
    bgLight: 'rgba(76, 141, 255, 0.12)',
    border: 'rgba(76, 141, 255, 0.35)',
    domain: 'codeforces.com',
    profileUrl: (u) => `https://codeforces.com/profile/${u}`,
  },
  github: {
    label: 'GitHub',
    color: '#58A6FF',
    bgLight: 'rgba(88, 166, 255, 0.12)',
    border: 'rgba(88, 166, 255, 0.35)',
    domain: 'github.com',
    profileUrl: (u) => `https://github.com/${u}`,
  },
  gfg: {
    label: 'GeeksforGeeks',
    color: '#3DDC84',
    bgLight: 'rgba(61, 220, 132, 0.12)',
    border: 'rgba(61, 220, 132, 0.35)',
    domain: 'geeksforgeeks.org',
    profileUrl: (u) => `https://www.geeksforgeeks.org/user/${u}/`,
  },
  geeksforgeeks: {
    label: 'GeeksforGeeks',
    color: '#3DDC84',
    bgLight: 'rgba(61, 220, 132, 0.12)',
    border: 'rgba(61, 220, 132, 0.35)',
    domain: 'geeksforgeeks.org',
    profileUrl: (u) => `https://www.geeksforgeeks.org/user/${u}/`,
  },
  codechef: {
    label: 'CodeChef',
    color: '#F7931E',
    bgLight: 'rgba(247, 147, 30, 0.12)',
    border: 'rgba(247, 147, 30, 0.35)',
    domain: 'codechef.com',
    profileUrl: (u) => `https://www.codechef.com/users/${u}`,
  },
  hackerrank: {
    label: 'HackerRank',
    color: '#FF5C5C',
    bgLight: 'rgba(255, 92, 92, 0.12)',
    border: 'rgba(255, 92, 92, 0.35)',
    domain: 'hackerrank.com',
    profileUrl: (u) => `https://www.hackerrank.com/profile/${u}`,
  },
  atcoder: {
    label: 'AtCoder',
    color: '#9CA3AF',
    bgLight: 'rgba(156, 163, 175, 0.12)',
    border: 'rgba(156, 163, 175, 0.35)',
    domain: 'atcoder.jp',
    profileUrl: (u) => `https://atcoder.jp/users/${u}`,
  },
};

export function normalizePlatformKey(name) {
  if (!name) return '';
  const clean = name.toLowerCase().replace(/[\s\-_]/g, '');
  if (clean === 'leetcode' || clean === 'lc') return 'leetcode';
  if (clean === 'codeforces' || clean === 'cf') return 'codeforces';
  if (clean === 'gfg' || clean === 'geeksforgeeks' || clean === 'geeksforgeek') return 'gfg';
  if (clean === 'codechef' || clean === 'cc') return 'codechef';
  if (clean === 'hackerrank' || clean === 'hr') return 'hackerrank';
  if (clean === 'atcoder' || clean === 'ac') return 'atcoder';
  if (clean === 'github' || clean === 'gh') return 'github';
  return clean;
}

export default function PlatformNavTabs({ platforms = [], activeKey = '' }) {
  const location = useLocation();

  // Deduplicate platforms by canonical key
  const seen = new Set();
  const uniquePlatforms = [];

  for (const p of platforms) {
    if (!p) continue;
    const key = normalizePlatformKey(p.platform);
    if (key && !seen.has(key)) {
      seen.add(key);
      const conf = PLATFORM_CONFIG[key] || {
        label: p.platform,
        color: '#8B96AD',
        bgLight: 'rgba(139, 150, 173, 0.12)',
        border: 'rgba(139, 150, 173, 0.3)',
      };
      uniquePlatforms.push({
        ...p,
        key,
        conf,
      });
    }
  }

  const isOverview = location.pathname === '/dashboard';
  const isContests = location.pathname.includes('/contests');

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5 overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap shrink-0">
          {/* Main Combined Overview Tab */}
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              isOverview
                ? 'bg-accent/15 text-accent border border-accent/40 shadow-[0_0_15px_rgba(76,141,255,0.2)]'
                : 'text-muted hover:text-text hover:bg-surface2/60 border border-transparent'
            }`}
          >
            <Layers size={16} />
            <span>Combined Overview</span>
          </Link>

          {/* Separator */}
          {uniquePlatforms.length > 0 && (
            <div className="h-4 w-px bg-border/60 mx-1 shrink-0" />
          )}

          {/* Each Linked Platform Tab with Official SVG Logo */}
          {uniquePlatforms.map((p) => {
            const isActive =
              activeKey === p.key ||
              location.pathname === `/dashboard/platform/${p.key}` ||
              (p.key === 'github' && location.pathname === '/dashboard/github');

            return (
              <Link
                key={p.key}
                to={`/dashboard/platform/${p.key}`}
                className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'border shadow-md'
                    : 'text-muted hover:text-text hover:bg-surface2/60 border border-transparent'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: p.conf.bgLight,
                        borderColor: p.conf.border,
                        color: p.conf.color,
                        boxShadow: `0 0 16px ${p.conf.color}25`,
                      }
                    : {}
                }
              >
                <PlatformLogo platform={p.key} size={16} />
                <span>{p.conf.label}</span>
                {p.username && (
                  <span className="text-[11px] opacity-75 font-mono hidden md:inline">
                    @{p.username}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Contests Aggregator Tab */}
          <div className="h-4 w-px bg-border/60 mx-1 shrink-0" />
          <Link
            to="/dashboard/contests"
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              isContests
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'text-muted hover:text-text hover:bg-surface2/60 border border-transparent'
            }`}
          >
            <Trophy size={15} className="text-amber-400" />
            <span>Contests</span>
          </Link>
        </div>

        {/* Quick Add Platform Button */}
        <Link
          to="/dashboard/link"
          className="btn-secondary !px-3 !py-1.5 text-xs shrink-0 flex items-center gap-1.5 whitespace-nowrap ml-2"
        >
          <Plus size={13} />
          <span className="hidden sm:inline">Add Platform</span>
        </Link>
      </div>
    </div>
  );
}
