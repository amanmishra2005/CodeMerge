import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  BarChart2,
  PieChart as PieIcon,
  Activity,
  Sparkles,
  Zap,
  TrendingUp,
  Layers,
} from 'lucide-react';
import PlatformLogo from '../common/PlatformLogo.jsx';

const COLORS = {
  easy: '#3DDC84',
  medium: '#FFB454',
  hard: '#FF5C5C',
};

const PLATFORM_META = {
  leetcode: { label: 'LeetCode', color: '#FFB454' },
  codeforces: { label: 'Codeforces', color: '#4C8DFF' },
  gfg: { label: 'GeeksforGeeks', color: '#3DDC84' },
  geeksforgeeks: { label: 'GeeksforGeeks', color: '#3DDC84' },
  hackerrank: { label: 'HackerRank', color: '#00EA64' },
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

export default function DifficultyChart({ platforms = [], totals = {}, ranking = null }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'radar' | 'platforms' | 'difficulty'

  const codingPlatforms = platforms.filter(
    (p) => normalizeKey(p.platform) !== 'github'
  );

  const barData = codingPlatforms
    .filter((p) => {
      const easy = Number(p.easy) || 0;
      const medium = Number(p.medium) || 0;
      const hard = Number(p.hard) || 0;
      const total = Math.max(Number(p.totalSolved) || 0, easy + medium + hard);
      return total > 0;
    })
    .map((p) => {
      const platformKey = normalizeKey(p.platform);
      const meta = PLATFORM_META[platformKey] || { label: p.platform, color: '#8B96AD' };
      return {
        key: platformKey,
        name: meta.label,
        easy: Number(p.easy) || 0,
        medium: Number(p.medium) || 0,
        hard: Number(p.hard) || 0,
        total: (Number(p.easy) || 0) + (Number(p.medium) || 0) + (Number(p.hard) || 0),
      };
    });

  const easyCount = Number(totals?.easy) || 0;
  const medCount = Number(totals?.medium) || 0;
  const hardCount = Number(totals?.hard) || 0;
  const totalSolved = Math.max(Number(totals?.totalSolved) || 0, easyCount + medCount + hardCount);

  const pieData = [
    { name: 'Easy', value: easyCount, color: COLORS.easy },
    { name: 'Medium', value: medCount, color: COLORS.medium },
    { name: 'Hard', value: hardCount, color: COLORS.hard },
  ].filter((d) => d.value > 0);

  // Algorithmic Skill Radar Data
  const breakdown = ranking?.breakdown || {};
  const dsaNorm = Math.min(100, Math.round((totalSolved / 250) * 100)) || 25;
  const hardNorm = Math.min(100, Math.round((hardCount / 40) * 100)) || 15;
  const contestNorm = Math.min(100, Math.round(((breakdown.maxContestRating || 1200) / 2200) * 100)) || 30;
  const diversityNorm = Math.min(100, Math.round(((platforms.length || 1) / 5) * 100)) || 20;
  const openSourceNorm = Math.min(100, Math.round(((breakdown.githubCommits || 0) / 300) * 100)) || 20;
  const consistencyNorm = Math.min(100, Math.round(((easyCount + medCount * 1.5) / 180) * 100)) || 35;

  const radarData = [
    { subject: 'DSA Volume', score: Math.max(20, dsaNorm), fullMark: 100 },
    { subject: 'Hard Problems', score: Math.max(20, hardNorm), fullMark: 100 },
    { subject: 'Contest MMR', score: Math.max(20, contestNorm), fullMark: 100 },
    { subject: 'Multi-Platform', score: Math.max(25, diversityNorm), fullMark: 100 },
    { subject: 'Open Source', score: Math.max(20, openSourceNorm), fullMark: 100 },
    { subject: 'Consistency', score: Math.max(25, consistencyNorm), fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Interactive View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-accent/15 text-accent shadow-sm border border-accent/20">
            <Activity size={18} />
          </span>
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-text">
              Graphical Analytics & Mastery Radar
            </h2>
            <p className="text-xs text-muted">
              Live multi-platform problem distributions, algorithmic competence, and difficulty mix
            </p>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-surface2/60 p-1 rounded-xl border border-border/60 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted hover:text-text hover:bg-surface'
            }`}
          >
            All Views
          </button>
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted hover:text-text hover:bg-surface'
            }`}
          >
            Mastery Radar
          </button>
          <button
            onClick={() => setActiveTab('platforms')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'platforms'
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted hover:text-text hover:bg-surface'
            }`}
          >
            By Platform
          </button>
          <button
            onClick={() => setActiveTab('difficulty')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'difficulty'
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted hover:text-text hover:bg-surface'
            }`}
          >
            Difficulty Mix
          </button>
        </div>
      </div>

      {/* Grid: 2 Side-by-Side Symmetrical Charts */}
      {(activeTab === 'all' || activeTab === 'platforms' || activeTab === 'difficulty') && (
        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          {/* Widget 1: Stacked Bar Chart by Platform (7 cols when all, 12 cols when single) */}
          {(activeTab === 'all' || activeTab === 'platforms') && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`card p-6 border border-border/80 flex flex-col justify-between ${
                activeTab === 'all' ? 'lg:col-span-7' : 'lg:col-span-12'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-accent/15 text-accent">
                      <BarChart2 size={16} />
                    </span>
                    <h3 className="font-display text-base font-bold text-text">
                      Problems Solved by Platform
                    </h3>
                  </div>
                  <span className="text-xs text-muted font-mono">{codingPlatforms.length} Platforms Active</span>
                </div>

                {barData.length === 0 ? (
                  <div className="py-20 text-center text-sm text-muted">
                    No coding data yet — link your LeetCode, Codeforces, or GFG account to populate charts.
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                      <BarChart data={barData} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#26314D" opacity={0.6} />
                        <XAxis
                          dataKey="name"
                          stroke="#8B96AD"
                          fontSize={11}
                          interval={0}
                          tick={{ fill: '#8B96AD' }}
                        />
                        <YAxis stroke="#8B96AD" fontSize={11} tick={{ fill: '#8B96AD' }} />
                        <Tooltip
                          contentStyle={{
                            background: '#131B2E',
                            border: '1px solid #26314D',
                            borderRadius: 10,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                          }}
                          labelStyle={{ color: '#E8EDF7', fontWeight: 600 }}
                        />
                        <Legend />
                        <Bar dataKey="easy" stackId="a" fill={COLORS.easy} name="Easy" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="medium" stackId="a" fill={COLORS.medium} name="Medium" />
                        <Bar dataKey="hard" stackId="a" fill={COLORS.hard} name="Hard" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Platform breakdown chips */}
              {barData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center gap-2">
                  {barData.map((b) => (
                    <div
                      key={b.key}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface2/60 border border-border/60 text-xs"
                    >
                      <PlatformLogo platform={b.key} size={15} />
                      <span className="font-semibold text-text">{b.name}</span>
                      <span className="font-mono text-accent font-bold">{b.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Widget 2: Difficulty Mix Donut (5 cols when all, 12 cols when single) */}
          {(activeTab === 'all' || activeTab === 'difficulty') && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`card p-6 border border-border/80 flex flex-col justify-between ${
                activeTab === 'all' ? 'lg:col-span-5' : 'lg:col-span-12'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-easy/15 text-easy">
                      <PieIcon size={16} />
                    </span>
                    <h3 className="font-display text-base font-bold text-text">Difficulty Mix</h3>
                  </div>
                  <span className="text-xs font-mono text-muted">{totalSolved.toLocaleString()} solved</span>
                </div>

                <div style={{ width: '100%', height: 210 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData.length > 0 ? pieData : [{ name: 'None', value: 1, color: '#26314D' }]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={pieData.length > 1 ? 4 : 0}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} stroke="#131B2E" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#131B2E',
                          border: '1px solid #26314D',
                          borderRadius: 10,
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Percentage Pills */}
                {totalSolved > 0 && (
                  <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-border/40 text-center font-mono text-xs">
                    <div className="bg-surface2/60 p-2.5 rounded-xl border border-easy/25">
                      <div className="text-[10px] text-easy font-bold uppercase tracking-wider">EASY</div>
                      <div className="text-text font-extrabold text-sm mt-0.5">
                        {Math.round((easyCount / totalSolved) * 100)}%
                      </div>
                      <div className="text-[10px] text-muted font-mono">{easyCount} solved</div>
                    </div>
                    <div className="bg-surface2/60 p-2.5 rounded-xl border border-medium/25">
                      <div className="text-[10px] text-medium font-bold uppercase tracking-wider">MED</div>
                      <div className="text-text font-extrabold text-sm mt-0.5">
                        {Math.round((medCount / totalSolved) * 100)}%
                      </div>
                      <div className="text-[10px] text-muted font-mono">{medCount} solved</div>
                    </div>
                    <div className="bg-surface2/60 p-2.5 rounded-xl border border-hard/25">
                      <div className="text-[10px] text-hard font-bold uppercase tracking-wider">HARD</div>
                      <div className="text-text font-extrabold text-sm mt-0.5">
                        {Math.round((hardCount / totalSolved) * 100)}%
                      </div>
                      <div className="text-[10px] text-muted font-mono">{hardCount} solved</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Widget 3: Developer Skill Radar Spider Chart (Full Width Banner) */}
      {(activeTab === 'all' || activeTab === 'radar') && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="card p-6 sm:p-8 border border-border/80 bg-gradient-to-br from-surface to-surface2 relative overflow-hidden"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-easy/10 blur-3xl" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-accent/15 text-accent shadow-sm border border-accent/25">
                  <Activity size={18} />
                </span>
                <h3 className="font-display text-lg sm:text-xl font-bold text-text">
                  Algorithmic Mastery Radar
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Multi-dimensional performance matrix evaluating your problem volume, hard problem aptitude, competitive contest MMR, multi-platform polyglot reach, and GitHub contribution impact.
              </p>

              {/* Dimension scores matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                {radarData.map((d) => (
                  <div
                    key={d.subject}
                    className="p-2 rounded-lg bg-surface2/60 border border-border/60 text-xs flex flex-col justify-between"
                  >
                    <span className="text-[10px] text-muted font-semibold truncate">{d.subject}</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-mono font-bold text-text text-sm">{d.score}</span>
                      <span className="text-[10px] text-accent font-mono font-semibold">/ 100</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/30 px-3 py-1 text-xs font-semibold text-accent font-mono">
                  <Sparkles size={13} />
                  <span>Verified Competency Assessment</span>
                </span>
              </div>
            </div>

            <div style={{ width: '100%', maxWidth: '440px', height: '280px' }} className="mx-auto lg:mx-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#26314D" opacity={0.7} />
                  <PolarAngleAxis
                    dataKey="subject"
                    stroke="#8B96AD"
                    tick={{ fill: '#8B96AD', fontSize: 11, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#26314D" tick={false} />
                  <Radar
                    name="Skill Score"
                    dataKey="score"
                    stroke="#4C8DFF"
                    strokeWidth={2}
                    fill="#4C8DFF"
                    fillOpacity={0.35}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#131B2E',
                      border: '1px solid #26314D',
                      borderRadius: 8,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
