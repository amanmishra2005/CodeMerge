import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    n: '01',
    title: 'Create your account',
    desc: 'Sign up with your name, email and a password. Takes under a minute.',
  },
  {
    n: '02',
    title: 'Link your platforms',
    desc: 'Paste your LeetCode, Codeforces, GeeksforGeeks and HackerRank usernames into your dashboard.',
  },
  {
    n: '03',
    title: 'Refresh your stats',
    desc: 'CodeMerge fetches your solved counts and splits them into Easy, Medium and Hard.',
  },
  {
    n: '04',
    title: 'Get AI feedback',
    desc: 'Ask Gemini to analyze your merged profile and suggest exactly what to solve next.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border/60 bg-surface/40 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-2xl"
        >
          <span className="eyebrow">how it works</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-text md:text-4xl">
            From four usernames to one clear picture
          </h2>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-border md:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative"
            >
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-ink font-mono text-sm text-accent">
                {s.n}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-text">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
