import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2 } from 'lucide-react';

const nodes = [
  { label: 'LeetCode', color: '#FFB454', x: 40, y: 40 },
  { label: 'Codeforces', color: '#4C8DFF', x: 360, y: 40 },
  { label: 'CodeChef', color: '#A0785C', x: 40, y: 240 },
  { label: 'GeeksforGeeks', color: '#3DDC84', x: 360, y: 240 },
];

const center = { x: 200, y: 140 };

function useCountUp(target, durationMs = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / durationMs, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

function MergeGraph() {
  const count = useCountUp(1482);

  return (
    <div className="relative mx-auto w-full max-w-md p-4 rounded-3xl bg-surface/20 border border-border/20 shadow-[0_0_50px_rgba(76,141,255,0.05)] backdrop-blur-sm">
      <svg viewBox="0 0 400 300" className="w-full relative z-10">
        {nodes.map((n, i) => (
          <motion.line
            key={n.label}
            x1={n.x}
            y1={n.y}
            x2={center.x}
            y2={center.y}
            stroke={n.color}
            strokeWidth="2"
            strokeDasharray="400"
            initial={{ strokeDashoffset: 400, opacity: 0 }}
            animate={{ strokeDashoffset: 0, opacity: 0.7 }}
            transition={{ duration: 1.4, delay: 0.3 + i * 0.15, ease: 'easeInOut' }}
          />
        ))}

        {nodes.map((n, i) => (
          <motion.g
            key={n.label}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <circle cx={n.x} cy={n.y} r="26" fill="#131B2E" stroke={n.color} strokeWidth="2" />
            <text
              x={n.x}
              y={n.y + 42}
              textAnchor="middle"
              className="font-mono"
              fontSize="11"
              fill="#8B96AD"
            >
              {n.label}
            </text>
          </motion.g>
        ))}

        <motion.circle
          cx={center.x}
          cy={center.y}
          r="46"
          fill="url(#glow)"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'backOut' }}
        />
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4C8DFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#131B2E" stopOpacity="0.9" />
          </radialGradient>
        </defs>
      </svg>

      <div
        className="pointer-events-none absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2 text-center z-20"
        style={{ width: 140 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="font-mono text-3xl font-bold text-text drop-shadow-[0_0_15px_rgba(76,141,255,0.6)]"
        >
          {count.toLocaleString()}
        </motion.div>
        <div className="font-mono text-[9px] uppercase tracking-widest text-muted">solved · merged</div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-16 md:pt-24 border-b border-border/40">
      {/* Futuristic grid backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)] pointer-events-none" />
      <div className="mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="eyebrow inline-flex items-center gap-2">
            <Code2 size={14} /> one profile, every platform
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-text md:text-6xl">
            Every problem you've
            <br />
            solved, <span className="text-accent">merged</span> into one graph.
          </h1>
          <p className="mt-6 max-w-lg font-body text-lg text-muted">
            Link all your coding profiles in one place. CodeMerge automatically pulls solve counts or lets you manually log custom platform metrics, combining them into one unified graph with interactive AI feedback.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary">
              Merge your stats <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn-secondary">
              See how it works
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="card relative animate-floatY p-6"
        >
          <MergeGraph />
        </motion.div>
      </div>
    </section>
  );
}
