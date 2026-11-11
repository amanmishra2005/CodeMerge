import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  Clock,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Flame,
  CheckCircle2,
  Copy,
  Share2,
  ArrowRight,
  Layers,
  Sparkles,
  Sliders,
  Code2,
  Terminal,
  Bookmark,
  BookmarkCheck,
  Download,
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PlatformNavTabs, {
  PLATFORM_CONFIG,
  normalizePlatformKey,
} from '../components/dashboard/PlatformNavTabs.jsx';
import PlatformLogo from '../components/common/PlatformLogo.jsx';
import api from '../api/axios.js';

const PLATFORMS_FILTER = [
  { key: 'all', label: 'All Platforms', color: '#4C8DFF' },
  { key: 'leetcode', label: 'LeetCode', color: '#FFB454' },
  { key: 'codeforces', label: 'Codeforces', color: '#4C8DFF' },
  { key: 'codechef', label: 'CodeChef', color: '#F7931E' },
  { key: 'atcoder', label: 'AtCoder', color: '#9CA3AF' },
  { key: 'hackerrank', label: 'HackerRank', color: '#FF5C5C' },
  { key: 'gfg', label: 'GeeksforGeeks', color: '#3DDC84' },
];

function formatContestDateTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;

  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getTimeZoneAbbreviation() {
  try {
    return Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value || 'Local';
  } catch {
    return 'Local';
  }
}

function getRelativeTimeNotice(startTimeIso, endTimeIso) {
  const now = new Date().getTime();
  const start = new Date(startTimeIso).getTime();
  const end = new Date(endTimeIso).getTime();

  if (now >= start && now <= end) {
    const diffMins = Math.max(1, Math.round((end - now) / 60000));
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return {
      isLive: true,
      text: hrs > 0 ? `Ends in ${hrs}h ${mins}m` : `Ends in ${mins}m`,
    };
  }

  const diffMins = Math.round((start - now) / 60000);
  if (diffMins < 0) {
    return { isLive: false, text: 'Concluded' };
  }

  const days = Math.floor(diffMins / (24 * 60));
  const hrs = Math.floor((diffMins % (24 * 60)) / 60);
  const mins = diffMins % 60;

  if (days > 0) {
    return { isLive: false, text: `Starts in ${days}d ${hrs}h` };
  }
  if (hrs > 0) {
    return { isLive: false, text: `Starts in ${hrs}h ${mins}m` };
  }
  return { isLive: false, text: `Starts in ${mins}m` };
}

function getGoogleCalendarUrl(contest) {
  const formatTime = (iso) =>
    new Date(iso).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const startStr = formatTime(contest.startTime);
  const endStr = formatTime(contest.endTime);
  const title = encodeURIComponent(`${contest.platformLabel}: ${contest.name}`);
  const details = encodeURIComponent(
    `Compete in ${contest.name} on ${contest.platformLabel}.\nOfficial URL: ${contest.url}\n\nTracked via CodeMerge.`
  );
  const location = encodeURIComponent(contest.url);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
}

export default function ContestsPage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'live' | '24h' | 'upcoming'
  const [copiedId, setCopiedId] = useState(null);
  const [userPlatforms, setUserPlatforms] = useState([]);

  const userTimezone = getTimeZoneAbbreviation();

  const loadContests = async (force = false) => {
    if (!force) setLoading(true);
    else setSyncing(true);

    try {
      const url = force ? '/contests?refresh=true' : '/contests';
      const res = await api.get(url);
      setContests(res.data.contests || []);
    } catch (err) {
      console.error('Failed to load contests:', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  // Load user linked platforms for the navigation tabs
  useEffect(() => {
    api
      .get('/stats/me')
      .then((res) => {
        setUserPlatforms(res.data.platforms || []);
      })
      .catch(() => {});

    loadContests(false);
  }, []);

  const handleCopyLink = (contest) => {
    navigator.clipboard.writeText(contest.url);
    setCopiedId(contest.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter and search
  const filteredContests = contests.filter((c) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchPlat = c.platformLabel?.toLowerCase().includes(q);
      if (!matchName && !matchPlat) return false;
    }

    // 2. Platform filter
    if (selectedPlatform !== 'all') {
      const pKey = normalizePlatformKey(c.platform);
      if (pKey !== selectedPlatform) return false;
    }

    // 3. Status Filter
    const now = new Date().getTime();
    const start = new Date(c.startTime).getTime();
    const end = new Date(c.endTime).getTime();
    const isLive = now >= start && now <= end;
    const within24h = start - now > 0 && start - now <= 24 * 3600 * 1000;

    if (statusFilter === 'live' && !isLive) return false;
    if (statusFilter === '24h' && !within24h && !isLive) return false;
    if (statusFilter === 'upcoming' && isLive) return false;

    return true;
  });

  const liveCount = contests.filter((c) => {
    const now = new Date().getTime();
    return (
      now >= new Date(c.startTime).getTime() &&
      now <= new Date(c.endTime).getTime()
    );
  }).length;

  return (
    <div className="min-h-screen bg-ink flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 sm:py-10 flex-grow space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-[0_0_15px_rgba(76,141,255,0.15)]">
                <Trophy size={22} />
              </span>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-text">
                  Upcoming Coding Contests
                </h1>
                <p className="text-xs sm:text-sm text-muted mt-0.5">
                  Unified schedule for LeetCode, Codeforces, CodeChef, AtCoder,
                  and GeeksforGeeks
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadContests(true)}
              disabled={syncing}
              className="btn-secondary !px-3.5 !py-2 text-xs sm:text-sm flex items-center gap-2"
            >
              <RefreshCw
                size={14}
                className={syncing ? 'animate-spin text-accent' : ''}
              />
              <span>{syncing ? 'Refreshing...' : 'Refresh Contests'}</span>
            </button>
            <Link
              to="/dashboard"
              className="btn-primary !px-3.5 !py-2 text-xs sm:text-sm flex items-center gap-1.5"
            >
              <Layers size={14} />
              <span>My Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs (if user has linked platforms) */}
        {userPlatforms.length > 0 && (
          <PlatformNavTabs platforms={userPlatforms} activeKey="contests" />
        )}

        {/* Filters and Search Toolbar */}
        <div className="card p-4 sm:p-5 border border-border space-y-4">
          {/* Top Filter Controls: Search & Status Pills */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by contest name, round, or platform..."
                className="w-full bg-surface2/60 border border-border/80 focus:border-accent rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-text placeholder-muted focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-text"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-surface2/60 rounded-xl border border-border/60 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-muted hover:text-text'
                }`}
              >
                All ({contests.length})
              </button>

              <button
                onClick={() => setStatusFilter('live')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  statusFilter === 'live'
                    ? 'bg-easy text-black shadow-sm'
                    : 'text-muted hover:text-text'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-easy opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-easy" />
                </span>
                <span>Live Now ({liveCount})</span>
              </button>

              <button
                onClick={() => setStatusFilter('24h')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === '24h'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-muted hover:text-text'
                }`}
              >
                Next 24 Hours
              </button>

              <button
                onClick={() => setStatusFilter('upcoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === 'upcoming'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-muted hover:text-text'
                }`}
              >
                Upcoming
              </button>
            </div>
          </div>

          {/* Platform Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <span className="text-xs text-muted shrink-0 mr-1 flex items-center gap-1">
              <Filter size={12} /> Platform:
            </span>
            {PLATFORMS_FILTER.map((p) => {
              const isSelected = selectedPlatform === p.key;
              const count =
                p.key === 'all'
                  ? contests.length
                  : contests.filter(
                      (c) => normalizePlatformKey(c.platform) === p.key
                    ).length;

              return (
                <button
                  key={p.key}
                  onClick={() => setSelectedPlatform(p.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap border ${
                    isSelected
                      ? 'shadow-sm'
                      : 'border-border/60 text-muted hover:text-text hover:bg-surface2/60'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${p.color}20`,
                          borderColor: `${p.color}50`,
                          color: p.color,
                        }
                      : {}
                  }
                >
                  {p.key !== 'all' ? (
                    <PlatformLogo platform={p.key} size={14} />
                  ) : (
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                  )}
                  <span>{p.label}</span>
                  <span className="font-mono text-[10px] opacity-75">
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contests Cards Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-28 space-y-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
            <span className="text-xs text-muted font-mono">
              Aggregating contest schedules...
            </span>
          </div>
        ) : filteredContests.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-12 text-center max-w-lg mx-auto border border-border"
          >
            <div className="h-16 w-16 rounded-2xl bg-surface2 flex items-center justify-center mx-auto text-muted mb-4">
              <Trophy size={32} />
            </div>
            <h3 className="font-display text-lg font-bold text-text">
              No matching contests found
            </h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              No contests match your current search criteria or filters. Try
              adjusting your platform or status filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPlatform('all');
                setStatusFilter('all');
              }}
              className="mt-5 btn-secondary text-xs"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredContests.map((contest, index) => {
              const platKey = normalizePlatformKey(contest.platform);
              const conf = PLATFORM_CONFIG[platKey] || {
                label: contest.platformLabel || 'Contest',
                color: '#4C8DFF',
                bgLight: 'rgba(76, 141, 255, 0.12)',
                border: 'rgba(76, 141, 255, 0.3)',
              };

              const relative = getRelativeTimeNotice(
                contest.startTime,
                contest.endTime
              );
              const isLive = relative.isLive;

              return (
                <motion.div
                  key={contest.id || index}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.03 }}
                  className={`card p-5 border flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative overflow-hidden group ${
                    isLive
                      ? 'border-easy/50 bg-gradient-to-br from-surface to-surface2 shadow-[0_0_20px_rgba(61,220,132,0.1)]'
                      : 'border-border/80 hover:border-accent/40 bg-surface'
                  }`}
                >
                  {/* Subtle platform glow corner */}
                  <div
                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl opacity-15"
                    style={{ backgroundColor: conf.color }}
                  />

                  <div>
                    {/* Header Row: Platform Badge & Live Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border"
                        style={{
                          backgroundColor: conf.bgLight,
                          borderColor: conf.border,
                          color: conf.color,
                        }}
                      >
                        <PlatformLogo platform={platKey} size={14} />
                        <span>{conf.label}</span>
                      </span>

                      {/* Live or countdown pill */}
                      {isLive ? (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-easy/20 text-easy border border-easy/40 flex items-center gap-1.5 animate-pulse">
                          <span className="h-2 w-2 rounded-full bg-easy" />
                          <span>LIVE NOW</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium text-muted bg-surface2 border border-border/60">
                          {relative.text}
                        </span>
                      )}
                    </div>

                    {/* Contest Title */}
                    <h3 className="font-display font-bold text-base text-text group-hover:text-accent transition-colors line-clamp-2">
                      {contest.name}
                    </h3>

                    {/* Contest Details Grid */}
                    <div className="mt-4 space-y-2 text-xs text-muted">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-muted/80 shrink-0" />
                        <span className="font-medium text-text">
                          {formatContestDateTime(contest.startTime)}{' '}
                          <span className="text-[10px] text-muted font-mono">
                            ({userTimezone})
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-muted/80 shrink-0" />
                        <span>
                          Duration:{' '}
                          <span className="font-mono text-text font-semibold">
                            {contest.durationFormatted || '2h'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-5 pt-3.5 border-t border-border/50 flex items-center justify-between gap-2">
                    {/* Primary Registration / Compete Link */}
                    <a
                      href={contest.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                        isLive
                          ? 'bg-easy text-black font-bold shadow-[0_0_15px_rgba(61,220,132,0.25)] hover:opacity-90'
                          : 'btn-primary !px-3.5 !py-2'
                      }`}
                    >
                      <span>{isLive ? 'Compete Now' : 'Register / View'}</span>
                      <ExternalLink size={12} />
                    </a>

                    {/* Utility icons: Add to GCal & Copy link */}
                    <div className="flex items-center gap-1">
                      <a
                        href={getGoogleCalendarUrl(contest)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-surface2/60 hover:bg-surface2 text-muted hover:text-accent border border-border/50 transition-colors"
                        title="Add to Google Calendar"
                      >
                        <Calendar size={14} />
                      </a>

                      <button
                        onClick={() => handleCopyLink(contest)}
                        className="p-2 rounded-lg bg-surface2/60 hover:bg-surface2 text-muted hover:text-text border border-border/50 transition-colors"
                        title="Copy contest link"
                      >
                        {copiedId === contest.id ? (
                          <CheckCircle2 size={14} className="text-easy" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

