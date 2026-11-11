import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Share2,
  Sparkles,
  Zap,
  TrendingUp,
  Shield,
  Layers,
  ChevronRight,
  ExternalLink,
  Award,
  Crown,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export default function RankHeroCard({ ranking, totals, user, onOpenShareModal }) {
  const r = ranking || {
    score: 0,
    tier: { name: 'Apprentice', title: 'Code Apprentice', color: '#8B96AD', badge: '🌱', bgGlow: 'rgba(139, 150, 173, 0.25)' },
    nextTier: { name: 'Knight', min: 1000 },
    progress: 0,
    pointsNeeded: 1000,
    percentile: 80,
    estimatedRank: 500,
    breakdown: {
      dsaPoints: 0,
      contestPoints: 0,
      githubPoints: 0,
      diversityMultiplier: 1.0,
      totalSolved: 0,
      linkedCount: 0,
    },
  };

  const tier = r.tier || {};
  const nextTier = r.nextTier;
  const breakdown = r.breakdown || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card relative overflow-hidden p-6 sm:p-8 border border-border/80 bg-gradient-to-br from-surface via-surface/90 to-surface2 shadow-2xl"
    >
      {/* Background radiant radial glow matching tier color */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl opacity-20 transition-all duration-700"
        style={{ backgroundColor: tier.color || '#4C8DFF' }}
      />
      <div
        className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full blur-3xl opacity-15 transition-all duration-700"
        style={{ backgroundColor: tier.color || '#4C8DFF' }}
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Column: Score, Tier Badge, Percentile */}
        <div className="space-y-4 max-w-xl">
          {/* Header pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide border shadow-sm"
              style={{
                backgroundColor: `${tier.color}15`,
                borderColor: `${tier.color}40`,
                color: tier.color,
              }}
            >
              <span className="text-sm">{tier.badge || '🏆'}</span>
              <span>{tier.name} Tier</span>
            </span>

            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 border border-accent/25 px-2.5 py-0.5 text-xs font-medium text-accent">
              <TrendingUp size={12} />
              <span>Top {r.percentile}% Globally</span>
            </span>

            {breakdown.diversityMultiplier > 1 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-easy/10 border border-easy/25 px-2.5 py-0.5 text-xs font-medium text-easy">
                <Sparkles size={12} />
                <span>{breakdown.diversityMultiplier}x Omni Multiplier</span>
              </span>
            )}
          </div>

          {/* MergeScore display */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
            <div className="flex items-baseline gap-2">
              <h2 className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-text">
                {r.score.toLocaleString()}
              </h2>
              <span className="font-display text-sm uppercase tracking-wider text-muted font-bold">
                MergeScore
              </span>
            </div>
            <span className="text-xs text-muted sm:ml-2">
              Ranked <strong className="text-text font-mono">#{r.estimatedRank.toLocaleString()}</strong> among developers
            </span>
          </div>

          <p className="text-sm text-muted leading-relaxed">
            Your unique CodeMerge developer score integrates problem solving volume & difficulty across all platforms, competitive contest MMR, and open-source contributions.
          </p>

          {/* Tier Progress Bar */}
          {nextTier && (
            <div className="space-y-2 pt-1 max-w-md">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted flex items-center gap-1">
                  Progress to <strong className="text-text">{nextTier.name}</strong>
                </span>
                <span className="font-mono font-semibold" style={{ color: tier.color }}>
                  {r.pointsNeeded.toLocaleString()} pts to rank up ({r.progress}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface2 overflow-hidden border border-border/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${r.progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: tier.color,
                    boxShadow: `0 0 10px ${tier.color}80`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Score Breakdown Matrix & Share Card Button */}
        <div className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:items-end justify-between shrink-0">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full sm:w-auto">
            <div className="rounded-xl border border-border/70 bg-surface/80 p-3 text-center sm:min-w-[90px]">
              <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">DSA Score</div>
              <div className="mt-1 font-mono text-base font-bold text-easy">
                +{breakdown.dsaPoints?.toLocaleString() || 0}
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface/80 p-3 text-center sm:min-w-[90px]">
              <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">Contest MMR</div>
              <div className="mt-1 font-mono text-base font-bold text-accent">
                +{breakdown.contestPoints?.toLocaleString() || 0}
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface/80 p-3 text-center sm:min-w-[90px]">
              <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">GitHub OS</div>
              <div className="mt-1 font-mono text-base font-bold text-medium">
                +{breakdown.githubPoints?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          {/* Social Share Call to Action Button */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onOpenShareModal}
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 !py-2.5 !px-5 text-sm font-display font-semibold shadow-[0_0_20px_rgba(76,141,255,0.25)] hover:shadow-[0_0_25px_rgba(76,141,255,0.4)] transition-all"
            >
              <Share2 size={16} />
              <span>Share Social Card</span>
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

