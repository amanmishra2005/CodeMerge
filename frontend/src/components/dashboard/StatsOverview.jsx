import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, BarChart2, Flame } from 'lucide-react';

function useCountUp(target) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const duration = 1200;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

function StatCard({ icon: Icon, label, value, color, delay }) {
  const count = useCountUp(value || 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="card p-5"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}22`, color }}>
          <Icon size={18} />
        </span>
      </div>
      <div className="mt-4 font-mono text-3xl font-bold text-text">{count}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </motion.div>
  );
}

export default function StatsOverview({ totals }) {
  const t = totals || { totalSolved: 0, easy: 0, medium: 0, hard: 0 };
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard icon={Trophy} label="Total solved" value={t.totalSolved} color="#4C8DFF" delay={0} />
      <StatCard icon={Zap} label="Easy solved" value={t.easy} color="#3DDC84" delay={0.08} />
      <StatCard icon={BarChart2} label="Medium solved" value={t.medium} color="#FFB454" delay={0.16} />
      <StatCard icon={Flame} label="Hard solved" value={t.hard} color="#FF5C5C" delay={0.24} />
    </div>
  );
}
