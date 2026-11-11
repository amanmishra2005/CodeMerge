import React from 'react';
import { motion } from 'framer-motion';
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
import { BarChart2, PieChart as PieIcon, Activity, Sparkles } from 'lucide-react';

const COLORS = { easy: '#3DDC84', medium: '#FFB454', hard: '#FF5C5C' };

const PLATFORM_SHORTS = {
  leetcode: 'LeetCode',
  codeforces: 'Codeforces',
  gfg: 'GFG',
  geeksforgeeks: 'GFG',
  hackerrank: 'HackerRank',
  codechef: 'CodeChef',
  atcoder: 'AtCoder',
  github: 'GitHub',
};

function normalizeKey(str) {
  if (!str) return '';
  const clean = str.toLowerCase().replace(/[\s\-_]/g, '');
  if (clean === 'geeksforgeek') return 'gfg';
  return clean;
}

export default function DifficultyChart({ platforms = [], totals = {}, ranking = null }) {
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
      const shortName = PLATFORM_SHORTS[platformKey] || p.platform;
      const suffix = p.label ? ` (${p.label})` : '';
      return {
        name: `${shortName}${suffix}`,
        easy: Number(p.easy) || 0,
        medium: Number(p.medium) || 0,
        hard: Number(p.hard) || 0,
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
    { subject: 'Hard Problem Skill', score: Math.max(20, hardNorm), fullMark: 100 },
    { subject: 'Contest MMR', score: Math.max(20, contestNorm), fullMark: 100 },
    { subject: 'Platform Diversity', score: Math.max(25, diversityNorm), fullMark: 100 },
    { subject: 'Open Source', score: Math.max(20, openSourceNorm), fullMark: 100 },
    { subject: 'Consistency', score: Math.max(25, consistencyNorm), fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Widget 1: Stacked Bar Chart by Platform (7 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-6 border border-border/80 lg:col-span-7 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-accent/15 text-accent">
                  <BarChart2 size={16} />
                </span>
                <h3 className="font-display text-base font-bold text-text">
                  Problems Solved by Platform & Difficulty
                </h3>
              </div>
              <span className="text-xs text-muted font-mono">{codingPlatforms.length} Coding Sources</span>
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
        </motion.div>

        {/* Widget 2: Difficulty Mix Donut (5 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card p-6 border border-border/80 lg:col-span-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-easy/15 text-easy">
                  <PieIcon size={16} />
                </span>
                <h3 className="font-display text-base font-bold text-text">Difficulty Mix</h3>
              </div>
              <span className="text-xs font-mono text-muted">{totalSolved} total</span>
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
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-center font-mono text-xs">
                <div className="bg-surface2/60 p-2 rounded-lg border border-easy/20">
                  <div className="text-[10px] text-easy font-semibold">EASY</div>
                  <div className="text-text font-bold mt-0.5">{Math.round((easyCount / totalSolved) * 100)}%</div>
                </div>
                <div className="bg-surface2/60 p-2 rounded-lg border border-medium/20">
                  <div className="text-[10px] text-medium font-semibold">MED</div>
                  <div className="text-text font-bold mt-0.5">{Math.round((medCount / totalSolved) * 100)}%</div>
                </div>
                <div className="bg-surface2/60 p-2 rounded-lg border border-hard/20">
                  <div className="text-[10px] text-hard font-semibold">HARD</div>
                  <div className="text-text font-bold mt-0.5">{Math.round((hardCount / totalSolved) * 100)}%</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Widget 3: Developer Skill Radar Spider Chart (Full Width / Balanced Banner) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="card p-6 sm:p-8 border border-border/80 bg-gradient-to-br from-surface to-surface2 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-accent/15 text-accent shadow-sm">
                <Activity size={16} />
              </span>
              <h3 className="font-display text-lg font-bold text-text">
                Algorithmic Mastery Radar
              </h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Real-time multi-dimensional profile assessing your problem solving volume, difficulty mastery, competitive contest MMR, platform polyglot diversity, and open-source GitHub footprint.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 border border-accent/30 px-3 py-1 text-xs font-semibold text-accent font-mono">
                <Sparkles size={13} />
                <span>Balanced Engineer Profile</span>
              </span>
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: '440px', height: '260px' }} className="mx-auto lg:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#26314D" opacity={0.7} />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="#8B96AD"
                  tick={{ fill: '#8B96AD', fontSize: 10, fontWeight: 600 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#26314D" tick={false} />
                <Radar
                  name="Skill Score"
                  dataKey="score"
                  stroke="#4C8DFF"
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
    </div>
  );
}
