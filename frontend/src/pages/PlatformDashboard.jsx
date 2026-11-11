import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Sliders,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  Trophy,
  Award,
  Star,
  CheckCircle2,
  Code2,
  Terminal,
  Github,
  GitCommit,
  GitFork,
  BookOpen,
  Calendar,
  Flame,
  TrendingUp,
  BarChart2,
  Users,
  MapPin,
  Building,
  Globe,
  Tag,
  Share2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PlatformNavTabs, {
  PLATFORM_CONFIG,
  normalizePlatformKey,
} from '../components/dashboard/PlatformNavTabs.jsx';
import SharableCardModal from '../components/dashboard/SharableCardModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';

// Codeforces rank color helper
function getCodeforcesRankColor(rankStr) {
  if (!rankStr) return '#4C8DFF';
  const r = rankStr.toLowerCase();
  if (r.includes('grandmaster')) return '#FF3333';
  if (r.includes('master')) return '#FF8800';
  if (r.includes('candidate')) return '#AA00AA';
  if (r.includes('expert')) return '#0000FF';
  if (r.includes('specialist')) return '#03A89E';
  if (r.includes('pupil')) return '#008000';
  return '#808080';
}

export default function PlatformDashboard({ defaultPlatform }) {
  const { platformKey: routeKey } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [platforms, setPlatforms] = useState([]);
  const [ranking, setRanking] = useState(null);
  const [totals, setTotals] = useState({ totalSolved: 0, easy: 0, medium: 0, hard: 0 });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'submissions' | 'topics'

  const currentKey = normalizePlatformKey(routeKey || defaultPlatform || 'leetcode');
  const conf = PLATFORM_CONFIG[currentKey] || {
    label: currentKey.charAt(0).toUpperCase() + currentKey.slice(1),
    color: '#8B96AD',
    bgLight: 'rgba(139, 150, 173, 0.12)',
    border: 'rgba(139, 150, 173, 0.3)',
    icon: Code2,
    profileUrl: () => '#',
  };

  const fetchStats = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get('/stats/me');
      setPlatforms(res.data.platforms || []);
      setRanking(res.data.ranking || null);
      setTotals(res.data.totals || {});
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(true);
  }, [currentKey]);

  // Sync specific platform
  const handleSyncPlatform = async () => {
    setSyncing(true);
    try {
      const res = await api.get(`/stats/refresh/${currentKey}`);
      if (res.data.platforms) {
        setPlatforms(res.data.platforms);
      } else {
        await fetchStats(false);
      }
    } catch (err) {
      console.warn('Single platform refresh failed, trying full refresh:', err);
      try {
        const fullRes = await api.get('/stats/refresh');
        setPlatforms(fullRes.data.platforms || []);
      } catch (fullErr) {
        console.error('Failed to refresh stats:', fullErr);
      }
    } finally {
      setSyncing(false);
    }
  };

  // Find linked platform in snapshot or user profile
  const userPlatform = (user?.platforms || []).find(
    (p) => normalizePlatformKey(p.platform) === currentKey
  );
  const snapshotPlatform = platforms.find(
    (p) => normalizePlatformKey(p.platform) === currentKey
  );

  const platformData =
    snapshotPlatform ||
    (userPlatform
      ? {
          platform: conf.label,
          username: userPlatform.username,
          label: userPlatform.label || '',
          totalSolved: Number(userPlatform.totalSolved) || 0,
          easy: Number(userPlatform.easy) || 0,
          medium: Number(userPlatform.medium) || 0,
          hard: Number(userPlatform.hard) || 0,
          commits: Number(userPlatform.commits) || 0,
          error: null,
        }
      : null);

  const isLinked = Boolean(platformData && platformData.username);

  // Difficulty stats calculations
  const easy = Number(platformData?.easy) || 0;
  const medium = Number(platformData?.medium) || 0;
  const hard = Number(platformData?.hard) || 0;
  const isGH = currentKey === 'github';
  const totalSolved = isGH
    ? 0
    : Math.max(Number(platformData?.totalSolved) || 0, easy + medium + hard);

  // Recharts difficulty chart data
  const chartData = [
    { name: 'Easy', value: easy, color: '#3DDC84' },
    { name: 'Medium', value: medium, color: '#FFB454' },
    { name: 'Hard', value: hard, color: '#FF5C5C' },
  ].filter((d) => d.value > 0);

  // Fallback if 0 solved
  const hasChartData = chartData.length > 0;
  const displayChartData = hasChartData
    ? chartData
    : [{ name: 'Unsolved', value: 1, color: '#26314D' }];

  // Custom AI / Mentor insights for this platform
  const getMentorAdvice = () => {
    switch (currentKey) {
      case 'leetcode':
        if (hard < 10) {
          return {
            title: 'Level Up to Hard Problems',
            advice:
              'You have a solid foundation in Easy and Medium questions. Challenge yourself with dynamic programming and graph hard problems to excel in top tech interviews.',
            tag: 'Interview Prep',
          };
        }
        return {
          title: 'Master Speed and Consistency',
          advice:
            'Participate regularly in LeetCode weekly contests to improve problem-solving speed under time constraints.',
          tag: 'Contest Strategy',
        };
      case 'codeforces':
        return {
          title: 'Push Past Rating Milestones',
          advice:
            'Focus on solving Div 2 C and D problems. Study number theory, greedy algorithms, and data structures to elevate your rating tier.',
          tag: 'Competitive Programming',
        };
      case 'github':
        return {
          title: 'Showcase Open Source Impact',
          advice:
            'Maintain continuous commit streaks, document thorough READMEs with live deployment links, and contribute to notable open-source repositories.',
          tag: 'Engineering Portfolio',
        };
      case 'gfg':
        return {
          title: 'Maintain POTD Streaks',
          advice:
            'Consistently solve the Problem of the Day to build interview muscle memory and climb your university / institute leaderboard.',
          tag: 'Streak Optimization',
        };
      case 'codechef':
        return {
          title: 'Compete for the Next Star',
          advice:
            'Participate in CodeChef Starters and Cook-Offs. Practice Div 2 problems to accelerate your transition to the next star tier.',
          tag: 'Rating Climb',
        };
      case 'hackerrank':
        return {
          title: 'Earn Gold Badges',
          advice:
            'Target 5-star gold badges in Problem Solving and your preferred core language (Python, C++, or Java).',
          tag: 'Skill Certification',
        };
      default:
        return {
          title: 'Keep Practicing Daily',
          advice:
            'Track your daily problem solving habits and aim for balanced difficulty progression across all your linked platforms.',
          tag: 'Daily Habit',
        };
    }
  };

  const advice = getMentorAdvice();
  const IconComponent = conf.icon || Code2;

  return (
    <div className="min-h-screen bg-ink flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 sm:py-10 flex-grow space-y-6">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-2 rounded-xl bg-surface2/60 hover:bg-surface2 text-muted hover:text-text transition-all border border-border/40"
              title="Back to Overview"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: conf.color }}
                />
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-text">
                  {conf.label} Dashboard
                </h1>
                {platformData?.label && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface2 border border-border font-mono text-muted">
                    {platformData.label}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted mt-0.5">
                Detailed metrics, problem analytics, and activity for @
                {platformData?.username || routeKey}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShareModalOpen(true)}
              className="btn-primary !px-3.5 !py-2 text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(76,141,255,0.2)]"
            >
              <Share2 size={14} />
              <span>Share Card</span>
            </button>

            {isLinked && (
              <button
                onClick={handleSyncPlatform}
                disabled={syncing}
                className="btn-secondary !px-3.5 !py-2 text-xs sm:text-sm flex items-center gap-2"
              >
                <RefreshCw
                  size={14}
                  className={syncing ? 'animate-spin text-accent' : ''}
                />
                {syncing ? 'Refreshing...' : 'Sync Data'}
              </button>
            )}

            {isLinked && platformData?.username && (
              <a
                href={
                  typeof conf.profileUrl === 'function'
                    ? conf.profileUrl(platformData.username)
                    : `https://${conf.domain}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary !px-3.5 !py-2 text-xs sm:text-sm flex items-center gap-1.5"
              >
                <span>View Profile</span>
                <ExternalLink size={13} />
              </a>
            )}

            <Link
              to="/dashboard/link"
              className="btn-primary !px-3.5 !py-2 text-xs sm:text-sm flex items-center gap-1.5"
            >
              <Sliders size={14} />
              <span>Configure</span>
            </Link>
          </div>
        </div>

        {/* Global Platform Navigation Tabs */}
        <PlatformNavTabs platforms={platforms} activeKey={currentKey} />

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
          </div>
        ) : !isLinked ? (
          /* Not linked state */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center max-w-xl mx-auto card p-8 border border-border/80"
          >
            <div
              className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl"
              style={{
                backgroundColor: conf.bgLight,
                borderColor: conf.border,
                borderWidth: 1,
              }}
            >
              <IconComponent size={48} style={{ color: conf.color }} />
            </div>

            <h2 className="text-xl font-bold text-text">
              {conf.label} Is Not Linked Yet
            </h2>
            <p className="mt-2 text-muted text-sm max-w-md">
              Connect your {conf.label} username to inspect solved problems,
              contests, difficulty distributions, and personalized mentorship
              insights.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Link to="/dashboard/link" className="btn-primary">
                Link {conf.label} Profile
              </Link>
              <Link to="/dashboard" className="btn-secondary">
                Back to Overview
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Linked Platform Rich Dashboard */
          <div className="space-y-6 animate-fade-in">
            {/* Warning banner if cached / fetch error */}
            {platformData.error && (
              <div className="p-4 rounded-xl border border-accent2/30 bg-accent2/10 flex items-start gap-3 text-sm text-text">
                <AlertTriangle
                  size={18}
                  className="text-accent2 mt-0.5 shrink-0"
                />
                <div className="flex-grow">
                  <span className="font-semibold text-accent2">Notice: </span>
                  {platformData.error}
                  <span className="text-xs text-muted block mt-0.5">
                    Displaying previously cached or manually saved profile
                    information.
                  </span>
                </div>
                <button
                  onClick={handleSyncPlatform}
                  className="text-xs text-accent underline shrink-0 hover:opacity-80"
                >
                  Retry Sync
                </button>
              </div>
            )}

            {/* Profile Overview Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 border border-border relative overflow-hidden bg-gradient-to-br from-surface to-surface2"
            >
              <div
                className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: conf.color }}
              />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                {/* User Identity info */}
                <div className="flex items-center gap-4">
                  {platformData.avatar ? (
                    <img
                      src={platformData.avatar}
                      alt={platformData.username}
                      className="h-16 w-16 rounded-2xl object-cover border-2 shadow-lg"
                      style={{ borderColor: conf.color }}
                    />
                  ) : (
                    <div
                      className="h-16 w-16 rounded-2xl flex items-center justify-center font-display font-bold text-2xl shadow-lg border"
                      style={{
                        backgroundColor: conf.bgLight,
                        borderColor: conf.border,
                        color: conf.color,
                      }}
                    >
                      {platformData.username?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display text-xl sm:text-2xl font-bold text-text">
                        {platformData.name ||
                          platformData.realName ||
                          platformData.username}
                      </h2>
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border"
                        style={{
                          backgroundColor: conf.bgLight,
                          borderColor: conf.border,
                          color: conf.color,
                        }}
                      >
                        <CheckCircle2 size={12} />
                        Connected
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs sm:text-sm text-muted flex-wrap">
                      <span className="font-mono text-accent">
                        @{platformData.username}
                      </span>
                      {platformData.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {platformData.location}
                        </span>
                      )}
                      {platformData.school && (
                        <span className="flex items-center gap-1">
                          <Building size={12} /> {platformData.school}
                        </span>
                      )}
                      {platformData.country && (
                        <span className="flex items-center gap-1">
                          <Globe size={12} /> {platformData.country}
                        </span>
                      )}
                    </div>

                    {platformData.bio && (
                      <p className="text-xs text-muted/90 mt-2 max-w-xl line-clamp-2">
                        {platformData.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick KPI badges on the hero */}
                <div className="flex items-center gap-3 sm:gap-6 border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-6 flex-wrap">
                  {/* For GitHub */}
                  {isGH ? (
                    <>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold font-mono text-accent">
                          {platformData.commits || 0}
                        </div>
                        <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                          Commits
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold font-mono text-easy">
                          {platformData.publicRepos ||
                            platformData.topRepositories?.length ||
                            0}
                        </div>
                        <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                          Repositories
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold font-mono text-medium">
                          {platformData.totalStars || 0}
                        </div>
                        <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                          Stars Earned
                        </div>
                      </div>
                    </>
                  ) : (
                    /* For Coding Platforms */
                    <>
                      <div className="text-center">
                        <div
                          className="text-2xl sm:text-3xl font-bold font-mono"
                          style={{ color: conf.color }}
                        >
                          {totalSolved}
                        </div>
                        <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                          Total Solved
                        </div>
                      </div>

                      {/* Platform-specific badge 1 */}
                      {currentKey === 'codeforces' && platformData.rating && (
                        <div className="text-center">
                          <div
                            className="text-2xl sm:text-3xl font-bold font-mono"
                            style={{
                              color: getCodeforcesRankColor(platformData.rank),
                            }}
                          >
                            {platformData.rating}
                          </div>
                          <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                            {platformData.rank || 'Rating'}
                          </div>
                        </div>
                      )}

                      {currentKey === 'leetcode' &&
                        platformData.contest?.rating && (
                          <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold font-mono text-accent">
                              {platformData.contest.rating}
                            </div>
                            <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                              Contest Rating
                            </div>
                          </div>
                        )}

                      {currentKey === 'codechef' && platformData.stars && (
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold font-mono text-medium">
                            {platformData.stars}
                          </div>
                          <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                            CodeChef Tier
                          </div>
                        </div>
                      )}

                      {currentKey === 'gfg' && platformData.codingScore > 0 && (
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold font-mono text-easy">
                            {platformData.codingScore}
                          </div>
                          <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                            Score
                          </div>
                        </div>
                      )}

                      {currentKey === 'hackerrank' &&
                        platformData.badgeCount > 0 && (
                          <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold font-mono text-accent2">
                              {platformData.badgeCount}
                            </div>
                            <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                              Badges
                            </div>
                          </div>
                        )}

                      {currentKey === 'atcoder' && platformData.acRank && (
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold font-mono text-text">
                            #{platformData.acRank}
                          </div>
                          <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                            AC Rank
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {isGH ? (
                <>
                  <div className="card p-4 border border-border">
                    <div className="flex items-center justify-between text-muted text-xs">
                      <span>Total Commits</span>
                      <GitCommit size={15} className="text-accent" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-text mt-2">
                      {platformData.commits || 0}
                    </div>
                    <div className="text-[11px] text-muted mt-1">
                      Indexed public contributions
                    </div>
                  </div>

                  <div className="card p-4 border border-border">
                    <div className="flex items-center justify-between text-muted text-xs">
                      <span>Public Repos</span>
                      <BookOpen size={15} className="text-easy" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-easy mt-2">
                      {platformData.publicRepos || 0}
                    </div>
                    <div className="text-[11px] text-muted mt-1">
                      Active public projects
                    </div>
                  </div>

                  <div className="card p-4 border border-border">
                    <div className="flex items-center justify-between text-muted text-xs">
                      <span>Total Stars</span>
                      <Star size={15} className="text-medium" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-medium mt-2">
                      {platformData.totalStars || 0}
                    </div>
                    <div className="text-[11px] text-muted mt-1">
                      Stars across user repos
                    </div>
                  </div>

                  <div className="card p-4 border border-border">
                    <div className="flex items-center justify-between text-muted text-xs">
                      <span>Followers</span>
                      <Users size={15} className="text-accent2" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-text mt-2">
                      {platformData.followers || 0}
                    </div>
                    <div className="text-[11px] text-muted mt-1">
                      {platformData.following || 0} following
                    </div>
                  </div>
                </>
              ) : (
                /* Coding platform KPI cards */
                <>
                  <div className="card p-4 border border-border">
                    <div className="flex items-center justify-between text-muted text-xs">
                      <span>Total Solved</span>
                      <Award size={15} style={{ color: conf.color }} />
                    </div>
                    <div className="text-2xl font-bold font-mono text-text mt-2">
                      {totalSolved}
                    </div>
                    <div className="text-[11px] text-muted mt-1">
                      Verified solutions
                    </div>
                  </div>

                  <div className="card p-4 border border-border">
                    <div className="flex items-center justify-between text-muted text-xs">
                      <span>Easy</span>
                      <span className="h-2 w-2 rounded-full bg-easy" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-easy mt-2">
                      {easy}
                    </div>
                    <div className="text-[11px] text-muted mt-1">
                      {totalSolved > 0
                        ? `${Math.round((easy / totalSolved) * 100)}% of total`
                        : '0%'}
                    </div>
                  </div>

                  <div className="card p-4 border border-border">
                    <div className="flex items-center justify-between text-muted text-xs">
                      <span>Medium</span>
                      <span className="h-2 w-2 rounded-full bg-medium" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-medium mt-2">
                      {medium}
                    </div>
                    <div className="text-[11px] text-muted mt-1">
                      {totalSolved > 0
                        ? `${Math.round((medium / totalSolved) * 100)}% of total`
                        : '0%'}
                    </div>
                  </div>

                  <div className="card p-4 border border-border">
                    <div className="flex items-center justify-between text-muted text-xs">
                      <span>Hard</span>
                      <span className="h-2 w-2 rounded-full bg-hard" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-hard mt-2">
                      {hard}
                    </div>
                    <div className="text-[11px] text-muted mt-1">
                      {totalSolved > 0
                        ? `${Math.round((hard / totalSolved) * 100)}% of total`
                        : '0%'}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Main Content Grid: Left side analytics + Right side platform deep-dive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Visual Charts & Difficulty */}
              <div className="space-y-6">
                {!isGH && (
                  /* Difficulty Distribution Chart */
                  <div className="card p-5 border border-border">
                    <h3 className="font-display font-semibold text-text text-sm flex items-center justify-between">
                      <span>Difficulty Breakdown</span>
                      <BarChart2 size={15} className="text-muted" />
                    </h3>

                    <div className="mt-4 h-48 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={displayChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={hasChartData ? 4 : 0}
                            dataKey="value"
                          >
                            {displayChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="#131B2E"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="card p-2 text-xs border border-border shadow-lg">
                                    <div
                                      className="font-semibold"
                                      style={{ color: data.color }}
                                    >
                                      {data.name}: {data.value}
                                    </div>
                                    {totalSolved > 0 && (
                                      <div className="text-muted">
                                        {Math.round(
                                          (data.value / totalSolved) * 100
                                        )}
                                        %
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Difficulty Progress Bars */}
                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-easy font-medium">Easy</span>
                          <span className="font-mono text-muted">
                            {easy} / {totalSolved}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-surface2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-easy rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                totalSolved > 0
                                  ? (easy / totalSolved) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-medium font-medium">Medium</span>
                          <span className="font-mono text-muted">
                            {medium} / {totalSolved}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-surface2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-medium rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                totalSolved > 0
                                  ? (medium / totalSolved) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-hard font-medium">Hard</span>
                          <span className="font-mono text-muted">
                            {hard} / {totalSolved}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-surface2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-hard rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                totalSolved > 0
                                  ? (hard / totalSolved) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Platform AI Mentor Advice Box */}
                <div className="card p-5 border border-accent/20 bg-gradient-to-br from-surface to-surface2 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-1.5 rounded-lg bg-accent/15 text-accent">
                      <Sparkles size={16} />
                    </span>
                    <span className="font-display font-bold text-text text-sm">
                      AI Mentor Advice
                    </span>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                      {advice.tag}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-text mb-1">
                    {advice.title}
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    {advice.advice}
                  </p>
                  <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center text-xs">
                    <Link
                      to="/dashboard/analysis"
                      className="text-accent hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Full Roadmap Analysis</span>
                      <ArrowLeft size={12} className="rotate-180" />
                    </Link>
                  </div>
                </div>

                {/* Languages breakdown (if available) */}
                {platformData.languages &&
                  platformData.languages.length > 0 && (
                    <div className="card p-5 border border-border">
                      <h3 className="font-display font-semibold text-text text-sm mb-3">
                        Languages Used
                      </h3>
                      <div className="space-y-2.5">
                        {platformData.languages.slice(0, 6).map((lang, idx) => {
                          const name = lang.languageName || lang.language;
                          const count =
                            lang.problemsSolved !== undefined
                              ? lang.problemsSolved
                              : lang.count;
                          return (
                            <div key={idx} className="text-xs">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium text-text">
                                  {name}
                                </span>
                                <span className="font-mono text-muted">
                                  {count} {isGH ? 'repos' : 'solved'}
                                </span>
                              </div>
                              <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    backgroundColor: conf.color,
                                    width: `${Math.min(
                                      100,
                                      Math.max(15, count * 5)
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>

              {/* Right Columns (2-Span): Deep Dive Platform Modules */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. LEETCODE SPECIFIC MODULES */}
                {currentKey === 'leetcode' && (
                  <div className="space-y-6">
                    {/* Contest performance banner */}
                    {platformData.contest && (
                      <div className="card p-5 border border-border bg-gradient-to-r from-surface to-surface2 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-accent/15 text-accent">
                            <Trophy size={24} />
                          </div>
                          <div>
                            <div className="text-xs text-muted">
                              LeetCode Contest Rating
                            </div>
                            <div className="text-2xl font-bold font-mono text-accent">
                              {platformData.contest.rating || 'Unrated'}
                            </div>
                            {platformData.contest.badge && (
                              <span className="text-xs text-easy font-semibold">
                                {platformData.contest.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center w-full sm:w-auto">
                          <div className="card p-2.5 bg-surface/50 border border-border/40">
                            <div className="text-sm font-bold font-mono text-text">
                              #{platformData.contest.globalRanking || '—'}
                            </div>
                            <div className="text-[10px] text-muted">
                              Global Rank
                            </div>
                          </div>
                          <div className="card p-2.5 bg-surface/50 border border-border/40">
                            <div className="text-sm font-bold font-mono text-easy">
                              {platformData.contest.topPercentage
                                ? `Top ${platformData.contest.topPercentage}%`
                                : '—'}
                            </div>
                            <div className="text-[10px] text-muted">
                              Percentile
                            </div>
                          </div>
                          <div className="card p-2.5 bg-surface/50 border border-border/40">
                            <div className="text-sm font-bold font-mono text-text">
                              {platformData.contest.attendedContestsCount || 0}
                            </div>
                            <div className="text-[10px] text-muted">
                              Attended
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Algorithmic Topics & Skills */}
                    {platformData.tagProblemCounts && (
                      <div className="card p-5 border border-border space-y-3">
                        <h3 className="font-display font-semibold text-text text-sm flex items-center gap-2">
                          <Tag size={16} className="text-accent" />
                          <span>Algorithmic Topics Solved</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {[
                            ...(platformData.tagProblemCounts.advanced || []),
                            ...(platformData.tagProblemCounts.intermediate || []),
                            ...(platformData.tagProblemCounts.fundamental || []),
                          ]
                            .slice(0, 16)
                            .map((t, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 rounded-xl bg-surface2 border border-border text-xs text-text flex items-center gap-2 hover:border-accent/40 transition-colors"
                              >
                                <span>{t.tagName}</span>
                                <span className="font-mono text-accent font-semibold text-[11px] bg-accent/10 px-1.5 py-0.5 rounded-md">
                                  {t.problemsSolved}
                                </span>
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Badges showcase */}
                    {platformData.badges && platformData.badges.length > 0 && (
                      <div className="card p-5 border border-border space-y-3">
                        <h3 className="font-display font-semibold text-text text-sm flex items-center gap-2">
                          <Award size={16} className="text-medium" />
                          <span>Badges Earned ({platformData.badges.length})</span>
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {platformData.badges.slice(0, 6).map((b, idx) => (
                            <div
                              key={idx}
                              className="card p-3 bg-surface/60 border border-border/60 flex items-center gap-3"
                            >
                              {b.icon ? (
                                <img
                                  src={
                                    b.icon.startsWith('http')
                                      ? b.icon
                                      : `https://leetcode.com${b.icon}`
                                  }
                                  alt={b.displayName}
                                  className="h-10 w-10 object-contain shrink-0"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-xl bg-medium/15 text-medium flex items-center justify-center shrink-0">
                                  <Award size={20} />
                                </div>
                              )}
                              <div className="overflow-hidden">
                                <div className="text-xs font-semibold text-text truncate">
                                  {b.displayName}
                                </div>
                                <div className="text-[10px] text-muted">
                                  LeetCode Badge
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Submissions */}
                    {platformData.recentSubmissions &&
                      platformData.recentSubmissions.length > 0 && (
                        <div className="card p-5 border border-border space-y-3">
                          <h3 className="font-display font-semibold text-text text-sm flex items-center justify-between">
                            <span>Recent Submissions</span>
                            <span className="text-xs text-muted font-mono">
                              Live activity
                            </span>
                          </h3>
                          <div className="divide-y divide-border/40 text-xs">
                            {platformData.recentSubmissions.map((s, idx) => (
                              <div
                                key={idx}
                                className="py-2.5 flex items-center justify-between gap-4"
                              >
                                <div className="truncate">
                                  <span className="font-medium text-text">
                                    {s.title}
                                  </span>
                                  <span className="ml-2 font-mono text-[11px] text-muted">
                                    {s.lang}
                                  </span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-easy/15 text-easy shrink-0">
                                  {s.statusDisplay || 'Accepted'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* 2. CODEFORCES SPECIFIC MODULES */}
                {currentKey === 'codeforces' && (
                  <div className="space-y-6">
                    {/* Rating & Rank Banner */}
                    <div className="card p-5 border border-border bg-gradient-to-r from-surface to-surface2 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-3 rounded-2xl"
                          style={{
                            backgroundColor: `${getCodeforcesRankColor(
                              platformData.rank
                            )}20`,
                            color: getCodeforcesRankColor(platformData.rank),
                          }}
                        >
                          <Trophy size={24} />
                        </div>
                        <div>
                          <div className="text-xs text-muted">
                            Codeforces Rank & Rating
                          </div>
                          <div
                            className="text-2xl font-bold font-mono"
                            style={{
                              color: getCodeforcesRankColor(platformData.rank),
                            }}
                          >
                            {platformData.rating || 'Unrated'}
                          </div>
                          <div
                            className="text-xs font-semibold capitalize"
                            style={{
                              color: getCodeforcesRankColor(platformData.rank),
                            }}
                          >
                            {platformData.rank || 'Newbie'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center w-full sm:w-auto">
                        <div className="card p-2.5 bg-surface/50 border border-border/40">
                          <div className="text-sm font-bold font-mono text-medium">
                            {platformData.maxRating || '—'}
                          </div>
                          <div className="text-[10px] text-muted">
                            Max Rating
                          </div>
                        </div>
                        <div className="card p-2.5 bg-surface/50 border border-border/40">
                          <div
                            className="text-sm font-bold font-mono capitalize truncate"
                            style={{
                              color: getCodeforcesRankColor(
                                platformData.maxRank
                              ),
                            }}
                          >
                            {platformData.maxRank || '—'}
                          </div>
                          <div className="text-[10px] text-muted">Max Rank</div>
                        </div>
                        <div className="card p-2.5 bg-surface/50 border border-border/40">
                          <div className="text-sm font-bold font-mono text-text">
                            {platformData.contestsCount || 0}
                          </div>
                          <div className="text-[10px] text-muted">Contests</div>
                        </div>
                      </div>
                    </div>

                    {/* Problem Tags Frequency */}
                    {platformData.tags && platformData.tags.length > 0 && (
                      <div className="card p-5 border border-border space-y-3">
                        <h3 className="font-display font-semibold text-text text-sm flex items-center gap-2">
                          <Tag size={16} className="text-accent" />
                          <span>Codeforces Problem Tags Solved</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {platformData.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 rounded-xl bg-surface2 border border-border text-xs text-text flex items-center gap-2"
                            >
                              <span className="capitalize">{t.tag}</span>
                              <span className="font-mono text-accent font-semibold text-[11px] bg-accent/10 px-1.5 py-0.5 rounded-md">
                                {t.count}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Submissions */}
                    {platformData.recentSubmissions &&
                      platformData.recentSubmissions.length > 0 && (
                        <div className="card p-5 border border-border space-y-3">
                          <h3 className="font-display font-semibold text-text text-sm">
                            Recent Submissions
                          </h3>
                          <div className="divide-y divide-border/40 text-xs">
                            {platformData.recentSubmissions.map((s, idx) => (
                              <div
                                key={idx}
                                className="py-2.5 flex items-center justify-between gap-4"
                              >
                                <div className="truncate">
                                  <span className="font-medium text-text">
                                    {s.contestId && s.index
                                      ? `${s.contestId}${s.index} - `
                                      : ''}
                                    {s.problemName}
                                  </span>
                                  {s.rating && (
                                    <span className="ml-2 font-mono text-[10px] bg-surface2 px-1.5 py-0.5 rounded text-muted">
                                      ★ {s.rating}
                                    </span>
                                  )}
                                  <span className="ml-2 font-mono text-[10px] text-muted">
                                    {s.language}
                                  </span>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                                    s.verdict === 'OK'
                                      ? 'bg-easy/15 text-easy'
                                      : 'bg-hard/15 text-hard'
                                  }`}
                                >
                                  {s.verdict === 'OK' ? 'Accepted' : s.verdict}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* 3. GITHUB SPECIFIC MODULES */}
                {isGH && (
                  <div className="space-y-6">
                    {/* Top Public Repositories */}
                    {platformData.topRepositories &&
                    platformData.topRepositories.length > 0 ? (
                      <div className="card p-5 border border-border space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-semibold text-text text-sm flex items-center gap-2">
                            <BookOpen size={16} className="text-accent" />
                            <span>Top Public Repositories</span>
                          </h3>
                          <span className="text-xs text-muted">
                            {platformData.topRepositories.length} projects
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {platformData.topRepositories.map((repo) => (
                            <a
                              key={repo.id}
                              href={repo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="card p-3.5 bg-surface/50 hover:bg-surface2/60 border border-border/60 hover:border-accent/40 transition-all flex flex-col justify-between group"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-sm font-semibold text-text group-hover:text-accent transition-colors truncate">
                                    {repo.name}
                                  </span>
                                  <ExternalLink
                                    size={12}
                                    className="text-muted group-hover:text-accent"
                                  />
                                </div>
                                {repo.description && (
                                  <p className="text-xs text-muted mt-1.5 line-clamp-2">
                                    {repo.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-3 mt-3 text-[11px] text-muted font-mono">
                                {repo.language && (
                                  <span className="flex items-center gap-1 text-text">
                                    <span className="h-2 w-2 rounded-full bg-accent" />
                                    {repo.language}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Star size={11} className="text-medium" />
                                  {repo.stars}
                                </span>
                                <span className="flex items-center gap-1">
                                  <GitFork size={11} />
                                  {repo.forks}
                                </span>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Git Terminal Activity Simulation */}
                    <div className="card p-5 bg-surface border border-border font-mono text-xs flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-3 text-muted">
                        <Terminal size={14} className="text-accent" />
                        <span>git_activity_stream.sh</span>
                      </div>
                      <div className="space-y-2 text-muted/90 bg-ink/50 p-3 rounded-xl border border-border/40">
                        <div>
                          <span className="text-accent">$</span> git log
                          --author="{platformData.username}" --stat -n 3
                        </div>
                        <div className="pl-3 border-l-2 border-border/60 space-y-1 text-muted">
                          <div>
                            * commit 9f8d1a2: feat(platform): unified dashboard
                            for all platforms
                          </div>
                          <div>
                            * commit 4c2e8b0: perf: optimize multi-source
                            caching and queries
                          </div>
                          <div>
                            * commit 1a3b5c7: docs: updated documentation and
                            metrics
                          </div>
                          {platformData.commits > 3 && (
                            <div className="italic text-[10px] text-muted/70">
                              ... plus {platformData.commits - 3} total indexed
                              commit activities on GitHub
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. CODECHEF SPECIFIC MODULES */}
                {currentKey === 'codechef' && (
                  <div className="space-y-6">
                    <div className="card p-5 border border-border bg-gradient-to-r from-surface to-surface2 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-medium/15 text-medium">
                          <Star size={24} />
                        </div>
                        <div>
                          <div className="text-xs text-muted">
                            CodeChef Rating
                          </div>
                          <div className="text-2xl font-bold font-mono text-medium">
                            {platformData.currentRating || 'Unrated'}
                          </div>
                          <div className="text-xs font-semibold text-text">
                            {platformData.stars || '1★'} •{' '}
                            {platformData.division || 'Division 4'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center w-full sm:w-auto">
                        <div className="card p-2.5 bg-surface/50 border border-border/40">
                          <div className="text-sm font-bold font-mono text-text">
                            {platformData.highestRating || '—'}
                          </div>
                          <div className="text-[10px] text-muted">
                            Peak Rating
                          </div>
                        </div>
                        <div className="card p-2.5 bg-surface/50 border border-border/40">
                          <div className="text-sm font-bold font-mono text-easy">
                            {platformData.globalRank
                              ? `#${platformData.globalRank}`
                              : '—'}
                          </div>
                          <div className="text-[10px] text-muted">
                            Global Rank
                          </div>
                        </div>
                        <div className="card p-2.5 bg-surface/50 border border-border/40">
                          <div className="text-sm font-bold font-mono text-accent">
                            {platformData.countryRank
                              ? `#${platformData.countryRank}`
                              : '—'}
                          </div>
                          <div className="text-[10px] text-muted">
                            Country Rank
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. GEEKSFORGEEKS SPECIFIC MODULES */}
                {currentKey === 'gfg' && (
                  <div className="space-y-6">
                    <div className="card p-5 border border-border bg-gradient-to-r from-surface to-surface2 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-easy/15 text-easy">
                          <Flame size={24} />
                        </div>
                        <div>
                          <div className="text-xs text-muted">
                            GeeksforGeeks Overall Score
                          </div>
                          <div className="text-2xl font-bold font-mono text-easy">
                            {platformData.codingScore || 0}
                          </div>
                          <div className="text-xs font-semibold text-text">
                            Monthly Score: {platformData.monthlyScore || 0}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center w-full sm:w-auto">
                        <div className="card p-2.5 bg-surface/50 border border-border/40">
                          <div className="text-sm font-bold font-mono text-medium">
                            {platformData.currentStreak || 0} days
                          </div>
                          <div className="text-[10px] text-muted">
                            Current POTD Streak
                          </div>
                        </div>
                        <div className="card p-2.5 bg-surface/50 border border-border/40">
                          <div className="text-sm font-bold font-mono text-accent">
                            {platformData.longestStreak || 0} days
                          </div>
                          <div className="text-[10px] text-muted">
                            Longest Streak
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. HACKERRANK SPECIFIC MODULES */}
                {currentKey === 'hackerrank' && (
                  <div className="space-y-6">
                    {platformData.badges && platformData.badges.length > 0 && (
                      <div className="card p-5 border border-border space-y-4">
                        <h3 className="font-display font-semibold text-text text-sm flex items-center gap-2">
                          <Award size={16} className="text-accent2" />
                          <span>
                            HackerRank Skill Badges ({platformData.badges.length}
                            )
                          </span>
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {platformData.badges.map((b, idx) => (
                            <div
                              key={idx}
                              className="card p-3 bg-surface/60 border border-border/60 flex flex-col justify-between"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-text truncate">
                                  {b.name}
                                </span>
                                <span className="flex items-center text-medium text-[11px] font-mono">
                                  {b.stars} <Star size={11} className="fill-medium ml-0.5" />
                                </span>
                              </div>
                              <div className="text-[10px] text-muted mt-2">
                                {b.solved} challenges solved
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. ATCODER SPECIFIC MODULES */}
                {currentKey === 'atcoder' && (
                  <div className="space-y-6">
                    <div className="card p-5 border border-border bg-gradient-to-r from-surface to-surface2 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-text/10 text-text">
                          <Trophy size={24} />
                        </div>
                        <div>
                          <div className="text-xs text-muted">
                            AtCoder Kenkoooo AC Rank
                          </div>
                          <div className="text-2xl font-bold font-mono text-text">
                            #{platformData.acRank || '—'}
                          </div>
                          <div className="text-xs text-muted">
                            Rated Point Sum: {platformData.ratedPointSum || '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sharable Card Modal */}
      <SharableCardModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        ranking={ranking}
        totals={totals}
        user={user}
        platforms={platforms}
      />

      <Footer />
    </div>
  );
}
