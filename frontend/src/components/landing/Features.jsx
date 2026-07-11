import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, BarChart3, Sparkles, ShieldCheck, GitMerge, Gauge } from 'lucide-react';

const features = [
  {
    icon: GitMerge,
    title: 'One link, every platform',
    desc: 'Connect LeetCode, Codeforces, CodeChef, AtCoder, or any custom platform usernames once — no repeated logins.',
  },
  {
    icon: BarChart3,
    title: 'Easy / Medium / Hard, broken down',
    desc: 'See your solved counts split by difficulty on every platform, and as one combined total.',
  },
  {
    icon: Sparkles,
    title: 'AI feedback on your profile',
    desc: 'Gemini reads your merged stats and tells you what to practice next, in plain language.',
  },
  {
    icon: Gauge,
    title: 'Refresh on demand',
    desc: 'Pull fresh numbers whenever you want — right after a contest or a late-night grind session.',
  },
  {
    icon: LayoutGrid,
    title: 'One unified dashboard',
    desc: 'Stop switching between multiple platforms just to know where you stand.',
  },
  {
    icon: ShieldCheck,
    title: 'Your data, your account',
    desc: 'Stats are tied to your account only, secured with hashed passwords and signed tokens.',
  },
];

export default function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-2xl"
        >
          <span className="eyebrow">features</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-text md:text-4xl">
            Everything you need to see your progress clearly
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card group p-6 transition-all duration-300 hover:border-accent/40 hover:bg-surface2/25 hover:shadow-[0_0_30px_rgba(76,141,255,0.06)] hover:-translate-y-1 cursor-default"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(76,141,255,0.1)]">
                <f.icon size={20} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-text transition-colors group-hover:text-accent">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
