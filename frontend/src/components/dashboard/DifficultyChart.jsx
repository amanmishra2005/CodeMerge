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
} from 'recharts';

const COLORS = { easy: '#3DDC84', medium: '#FFB454', hard: '#FF5C5C' };

const PLATFORM_SHORTS = {
  leetcode: 'LeetCode',
  codeforces: 'Codeforces',
  gfg: 'GFG',
  geeksforgeeks: 'GFG',
  hackerrank: 'HackerRank',
  codechef: 'CodeChef',
  atcoder: 'AtCoder',
};

export default function DifficultyChart({ platforms, totals }) {
  const barData = (platforms || [])
    .filter((p) => !p.error)
    .map((p) => {
      const platformKey = (p.platform || '').toLowerCase().trim();
      const shortName = PLATFORM_SHORTS[platformKey] || p.platform;
      const suffix = p.label ? ` (${p.label})` : ` (@${p.username})`;
      return {
        name: `${shortName}${suffix}`,
        easy: p.easy,
        medium: p.medium,
        hard: p.hard,
      };
    });

  const pieData = [
    { name: 'Easy', value: totals?.easy || 0, color: COLORS.easy },
    { name: 'Medium', value: totals?.medium || 0, color: COLORS.medium },
    { name: 'Hard', value: totals?.hard || 0, color: COLORS.hard },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-6 lg:col-span-3"
      >
        <h3 className="mb-4 font-display text-base font-semibold text-text">
          Solved by platform & difficulty
        </h3>
        {barData.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            No data yet — link a platform and refresh your stats.
          </p>
        ) : (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26314D" />
                <XAxis dataKey="name" stroke="#8B96AD" fontSize={11} interval={0} />
                <YAxis stroke="#8B96AD" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#131B2E', border: '1px solid #26314D', borderRadius: 8 }}
                  labelStyle={{ color: '#E8EDF7' }}
                />
                <Legend />
                <Bar dataKey="easy" stackId="a" fill={COLORS.easy} name="Easy" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" stackId="a" fill={COLORS.medium} name="Medium" />
                <Bar dataKey="hard" stackId="a" fill={COLORS.hard} name="Hard" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card p-6 lg:col-span-2"
      >
        <h3 className="mb-4 font-display text-base font-semibold text-text">Difficulty mix</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#131B2E', border: '1px solid #26314D', borderRadius: 8 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
