import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  Sparkles,
  Twitter,
  Linkedin,
  MessageCircle,
  ExternalLink,
  Flame,
  Trophy,
  GitMerge,
  Code2,
  TrendingUp,
  Layers,
  Award,
} from 'lucide-react';

const CARD_THEMES = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    bg: 'from-[#0b0f19] via-[#1a1236] to-[#0c1a2e]',
    canvasBg: ['#0b0f19', '#1a1236', '#0c1a2e'],
    border: 'border-purple-500/40',
    canvasBorder: 'rgba(168, 85, 247, 0.45)',
    accent: '#a855f7',
    accent2: '#06b6d4',
    glow: 'rgba(168, 85, 247, 0.35)',
    textAccent: 'text-purple-400',
    tagBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Cobalt',
    bg: 'from-[#07090e] via-[#0f172a] to-[#081226]',
    canvasBg: ['#07090e', '#0f172a', '#081226'],
    border: 'border-blue-500/40',
    canvasBorder: 'rgba(76, 141, 255, 0.45)',
    accent: '#4C8DFF',
    accent2: '#38bdf8',
    glow: 'rgba(76, 141, 255, 0.35)',
    textAccent: 'text-blue-400',
    tagBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  {
    id: 'gold',
    name: 'Grandmaster Gold',
    bg: 'from-[#0d0c07] via-[#241c09] to-[#151105]',
    canvasBg: ['#0d0c07', '#241c09', '#151105'],
    border: 'border-amber-500/45',
    canvasBorder: 'rgba(255, 180, 84, 0.5)',
    accent: '#FFB454',
    accent2: '#f59e0b',
    glow: 'rgba(255, 180, 84, 0.4)',
    textAccent: 'text-amber-400',
    tagBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  {
    id: 'matrix',
    name: 'Terminal Matrix',
    bg: 'from-[#050d09] via-[#092416] to-[#04120a]',
    canvasBg: ['#050d09', '#092416', '#04120a'],
    border: 'border-emerald-500/40',
    canvasBorder: 'rgba(61, 220, 132, 0.45)',
    accent: '#3DDC84',
    accent2: '#10b981',
    glow: 'rgba(61, 220, 132, 0.35)',
    textAccent: 'text-emerald-400',
    tagBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
];

// Universal Cross-Browser Canvas Rounded Rectangle Helper (works everywhere without ctx.roundRect)
function safeRoundRect(ctx, x, y, width, height, radius) {
  let r = typeof radius === 'number' ? radius : 8;
  if (Array.isArray(radius)) r = radius[0] || 8;
  if (width < 2 * r) r = width / 2;
  if (height < 2 * r) r = height / 2;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export default function SharableCardModal({ isOpen, onClose, ranking, totals, user, platforms }) {
  const [selectedTheme, setSelectedTheme] = useState(CARD_THEMES[0]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const canvasRef = useRef(null);

  if (!isOpen) return null;

  const r = ranking || {
    score: 0,
    tier: { name: 'Apprentice', title: 'Code Apprentice', color: '#8B96AD', badge: '🌱' },
    percentile: 80,
    estimatedRank: 500,
    breakdown: { totalSolved: 0, dsaPoints: 0, githubPoints: 0, maxContestRating: 0, githubCommits: 0 },
  };

  const t = totals || { totalSolved: 0, easy: 0, medium: 0, hard: 0 };
  const tier = r.tier || { name: 'Apprentice', color: '#8B96AD', badge: '🌱' };
  const breakdown = r.breakdown || {};
  const userName = user?.name || 'CodeMerge Developer';
  const userHandle = user?.email ? user.email.split('@')[0] : 'developer';

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/${user?._id || userHandle}`
    : `http://localhost:5180/share/${userHandle}`;

  const shareText = `🚀 My verified @CodeMerge Developer Scorecard:\n🔥 MergeScore: ${r.score.toLocaleString()} (${tier.name} Tier)\n🏆 Top ${r.percentile}% Globally • ${t.totalSolved} Problems Solved\nTrack your merged coding rank: ${shareUrl}`;

  // Safe High-Res Canvas Rendering for PNG Export
  const drawCanvas = () => {
    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 1200;
    const height = 675;

    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, selectedTheme.canvasBg[0]);
    bgGrad.addColorStop(0.5, selectedTheme.canvasBg[1]);
    bgGrad.addColorStop(1, selectedTheme.canvasBg[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Glow Circles
    const radGlow1 = ctx.createRadialGradient(width - 150, 150, 20, width - 150, 150, 350);
    radGlow1.addColorStop(0, selectedTheme.glow);
    radGlow1.addColorStop(1, 'transparent');
    ctx.fillStyle = radGlow1;
    ctx.fillRect(0, 0, width, height);

    const radGlow2 = ctx.createRadialGradient(150, height - 150, 20, 150, height - 150, 300);
    radGlow2.addColorStop(0, selectedTheme.glow);
    radGlow2.addColorStop(1, 'transparent');
    ctx.fillStyle = radGlow2;
    ctx.fillRect(0, 0, width, height);

    // 3. Card Border
    ctx.strokeStyle = selectedTheme.canvasBorder;
    ctx.lineWidth = 3;
    safeRoundRect(ctx, 16, 16, width - 32, height - 32, 20);
    ctx.stroke();

    // 4. Header Bar: Logo & Branding
    ctx.fillStyle = selectedTheme.accent;
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('⚡ CodeMerge', 50, 65);

    ctx.fillStyle = '#8B96AD';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('VERIFIED DEVELOPER SCORECARD', width - 280, 65);

    // 5. User Information
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(userName, 50, 130);

    ctx.fillStyle = '#8B96AD';
    ctx.font = '500 16px monospace';
    ctx.fillText(`@${userHandle} • Omni-Platform Engineer`, 50, 162);

    // 6. Tier Badge Pill
    ctx.fillStyle = `${tier.color || selectedTheme.accent}25`;
    ctx.strokeStyle = tier.color || selectedTheme.accent;
    ctx.lineWidth = 1.5;
    safeRoundRect(ctx, 50, 190, 220, 42, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = tier.color || selectedTheme.accent;
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`${tier.badge || '👑'}  ${tier.name} Tier`, 68, 217);

    // Percentile Pill
    ctx.fillStyle = 'rgba(76, 141, 255, 0.15)';
    ctx.strokeStyle = 'rgba(76, 141, 255, 0.4)';
    safeRoundRect(ctx, 285, 190, 210, 42, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4C8DFF';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`📈  Top ${r.percentile}% Worldwide`, 305, 217);

    // 7. Large Score Section (Right Side)
    ctx.fillStyle = '#8B96AD';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('MERGESCORE™', width - 340, 140);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 64px monospace';
    ctx.fillText(r.score.toLocaleString(), width - 340, 205);

    ctx.fillStyle = selectedTheme.accent;
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`GLOBAL RANK #${r.estimatedRank.toLocaleString()}`, width - 340, 235);

    // 8. Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 260);
    ctx.lineTo(width - 50, 260);
    ctx.stroke();

    // 9. Metrics Grid Cards
    const metrics = [
      { label: 'TOTAL SOLVED', val: t.totalSolved.toLocaleString(), color: '#4C8DFF' },
      { label: 'EASY SOLVED', val: (t.easy || 0).toLocaleString(), color: '#3DDC84' },
      { label: 'MEDIUM SOLVED', val: (t.medium || 0).toLocaleString(), color: '#FFB454' },
      { label: 'HARD SOLVED', val: (t.hard || 0).toLocaleString(), color: '#FF5C5C' },
      { label: 'GITHUB COMMITS', val: (breakdown.githubCommits || 0).toLocaleString(), color: '#38bdf8' },
      { label: 'BEST CONTEST MMR', val: (breakdown.maxContestRating || 'N/A').toString(), color: '#a855f7' },
    ];

    const cardW = 168;
    const cardH = 88;
    const startX = 50;
    const gapX = 18;
    const startY = 285;

    metrics.forEach((m, idx) => {
      const x = startX + idx * (cardW + gapX);
      const y = startY;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      safeRoundRect(ctx, x, y, cardW, cardH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#8B96AD';
      ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(m.label, x + 14, y + 26);

      ctx.fillStyle = m.color;
      ctx.font = 'bold 22px monospace';
      ctx.fillText(m.val, x + 14, y + 62);
    });

    // 10. Platform Pills Bar
    ctx.fillStyle = '#8B96AD';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('CONNECTED PLATFORMS:', 50, 420);

    const platList = (platforms || []).map((p) => p.platform || 'Platform');
    const platNames = platList.length > 0 ? platList : ['LeetCode', 'Codeforces', 'GitHub', 'GeeksforGeeks'];

    let pX = 225;
    platNames.forEach((pName) => {
      const pW = ctx.measureText(pName).width + 36;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      safeRoundRect(ctx, pX, 402, pW, 26, 13);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#E8EDF7';
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(`• ${pName}`, pX + 12, 419);
      pX += pW + 10;
    });

    // 11. Visual Difficulty Gradient Bar
    const totalS = Math.max(1, (t.easy || 0) + (t.medium || 0) + (t.hard || 0));
    const easyRatio = (t.easy || 0) / totalS;
    const medRatio = (t.medium || 0) / totalS;
    const hardRatio = (t.hard || 0) / totalS;

    const barX = 50;
    const barY = 460;
    const barW = width - 100;
    const barH = 14;

    ctx.fillStyle = '#131B2E';
    safeRoundRect(ctx, barX, barY, barW, barH, 7);
    ctx.fill();

    // Easy portion
    ctx.fillStyle = '#3DDC84';
    safeRoundRect(ctx, barX, barY, Math.max(8, barW * easyRatio), barH, 7);
    ctx.fill();

    // Medium portion
    ctx.fillStyle = '#FFB454';
    ctx.fillRect(barX + barW * easyRatio, barY, barW * medRatio, barH);

    // Hard portion
    ctx.fillStyle = '#FF5C5C';
    safeRoundRect(ctx, barX + barW * (easyRatio + medRatio), barY, Math.max(8, barW * hardRatio), barH, 7);
    ctx.fill();

    // 12. Footer Watermark
    ctx.fillStyle = '#8B96AD';
    ctx.font = '500 13px monospace';
    ctx.fillText(`🔗 Verify & Track your rank at ${shareUrl}`, 50, 630);

    ctx.fillStyle = selectedTheme.accent;
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('#CodeMerge', width - 150, 630);

    return canvas;
  };

  // Download Card as PNG Image
  const handleDownload = () => {
    setDownloading(true);
    try {
      const canvas = drawCanvas();
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `codemerge-${userHandle}-scorecard.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Copy Image directly to Clipboard
  const handleCopyImage = async () => {
    try {
      const canvas = drawCanvas();
      if (!canvas || !navigator.clipboard?.write) return;
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
      });
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  // Copy shareable link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const tweetIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const linkedInIntent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const whatsAppIntent = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const totalS = Math.max(1, (t.easy || 0) + (t.medium || 0) + (t.hard || 0));
  const easyPct = Math.round(((t.easy || 0) / totalS) * 100);
  const medPct = Math.round(((t.medium || 0) / totalS) * 100);
  const hardPct = Math.round(((t.hard || 0) / totalS) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-ink/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="card relative w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden border border-border shadow-2xl bg-surface/95"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent shadow-sm">
              <Sparkles size={18} />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-text">CodeMerge Social Card Studio</h3>
              <p className="text-xs text-muted">Generate & export high-res developer scorecards for social platforms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-surface2 hover:text-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Theme Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Card Theme:</span>
            <div className="flex flex-wrap items-center gap-2">
              {CARD_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedTheme.id === theme.id
                      ? 'border-2 text-text shadow-lg'
                      : 'border border-border/70 text-muted hover:text-text hover:bg-surface2'
                  }`}
                  style={{
                    borderColor: selectedTheme.id === theme.id ? theme.accent : undefined,
                    backgroundColor: selectedTheme.id === theme.id ? `${theme.accent}18` : undefined,
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* REAL LIVE DOM PREVIEW CARD (100% Reliable, Crisp & Responsive) */}
          <div
            className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 bg-gradient-to-br ${selectedTheme.bg} ${selectedTheme.border} shadow-2xl transition-all duration-300`}
            style={{
              boxShadow: `0 0 35px ${selectedTheme.glow}`,
            }}
          >
            {/* Ambient Corner Glows */}
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: selectedTheme.accent }}
            />
            <div
              className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: selectedTheme.accent2 }}
            />

            <div className="relative z-10 space-y-6">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white font-bold text-sm">
                    ⚡
                  </span>
                  <span className="font-display text-lg font-extrabold tracking-tight text-white">
                    CodeMerge
                  </span>
                </div>
                <div className="rounded-full bg-white/10 border border-white/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/90">
                  Verified Developer Scorecard
                </div>
              </div>

              {/* User & Score Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                    {userName}
                  </h2>
                  <p className="font-mono text-xs text-white/70 mt-0.5">
                    @{userHandle} • Omni-Platform Engineer
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border shadow-sm"
                      style={{
                        backgroundColor: `${tier.color || selectedTheme.accent}20`,
                        borderColor: tier.color || selectedTheme.accent,
                        color: tier.color || selectedTheme.accent,
                      }}
                    >
                      <span>{tier.badge || '👑'}</span>
                      <span>{tier.name} Tier</span>
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 border border-blue-400/40 px-2.5 py-1 text-xs font-semibold text-blue-300">
                      <TrendingUp size={12} />
                      <span>Top {r.percentile}% Worldwide</span>
                    </span>
                  </div>
                </div>

                {/* Big Score Box */}
                <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-4 sm:text-right shrink-0">
                  <div className="text-[10px] uppercase font-bold text-white/60 tracking-wider">
                    MergeScore™
                  </div>
                  <div className="font-mono text-3xl sm:text-4xl font-black text-white mt-0.5">
                    {r.score.toLocaleString()}
                  </div>
                  <div
                    className="font-mono text-xs font-bold mt-1"
                    style={{ color: selectedTheme.accent }}
                  >
                    GLOBAL RANK #{r.estimatedRank.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 pt-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-white/60">Total Solved</div>
                  <div className="font-mono text-lg font-bold text-blue-400 mt-1">
                    {t.totalSolved.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-white/60">Easy</div>
                  <div className="font-mono text-lg font-bold text-emerald-400 mt-1">
                    {(t.easy || 0).toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-white/60">Medium</div>
                  <div className="font-mono text-lg font-bold text-amber-400 mt-1">
                    {(t.medium || 0).toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-white/60">Hard</div>
                  <div className="font-mono text-lg font-bold text-rose-400 mt-1">
                    {(t.hard || 0).toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-white/60">Commits</div>
                  <div className="font-mono text-lg font-bold text-sky-400 mt-1">
                    {(breakdown.githubCommits || 0).toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-white/60">Best MMR</div>
                  <div className="font-mono text-lg font-bold text-purple-400 mt-1">
                    {(breakdown.maxContestRating || 'N/A').toString()}
                  </div>
                </div>
              </div>

              {/* Visual Difficulty Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-white/70 font-mono">
                  <span>Difficulty Mix</span>
                  <span>Easy {easyPct}% • Med {medPct}% • Hard {hardPct}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden flex">
                  <div style={{ width: `${easyPct}%` }} className="h-full bg-emerald-400" />
                  <div style={{ width: `${medPct}%` }} className="h-full bg-amber-400" />
                  <div style={{ width: `${hardPct}%` }} className="h-full bg-rose-400" />
                </div>
              </div>

              {/* Platforms Pills & Watermark */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-white/10 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-white/50 uppercase font-bold mr-1">Platforms:</span>
                  {(platforms && platforms.length > 0 ? platforms : [{ platform: 'LeetCode' }, { platform: 'Codeforces' }, { platform: 'GitHub' }]).map((p, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/90"
                    >
                      • {p.platform}
                    </span>
                  ))}
                </div>

                <div className="font-mono text-[11px] text-white/60">
                  {shareUrl}
                </div>
              </div>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">1-Click Share & Export:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-primary !py-2.5 !px-3 text-xs flex items-center justify-center gap-2 font-display font-semibold"
              >
                <Download size={15} />
                <span>{downloading ? 'Exporting...' : 'Download PNG'}</span>
              </button>

              <button
                onClick={handleCopyImage}
                className="btn-secondary !py-2.5 !px-3 text-xs flex items-center justify-center gap-2 font-display font-semibold"
              >
                {copiedImage ? <Check size={15} className="text-easy" /> : <Copy size={15} />}
                <span>{copiedImage ? 'Image Copied!' : 'Copy Image'}</span>
              </button>

              <a
                href={tweetIntent}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary !py-2.5 !px-3 text-xs flex items-center justify-center gap-2 font-display font-semibold hover:border-[#1DA1F2]/60 hover:text-[#1DA1F2]"
              >
                <Twitter size={15} className="text-[#1DA1F2]" />
                <span>Post on X</span>
              </a>

              <a
                href={linkedInIntent}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary !py-2.5 !px-3 text-xs flex items-center justify-center gap-2 font-display font-semibold hover:border-[#0A66C2]/60 hover:text-[#0A66C2]"
              >
                <Linkedin size={15} className="text-[#0A66C2]" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Direct Profile Link Row */}
          <div className="flex flex-col sm:flex-row items-center gap-2 rounded-xl border border-border/70 bg-surface2/60 p-3">
            <div className="flex-1 w-full min-w-0">
              <div className="text-[11px] text-muted uppercase font-semibold">Public Verification Link</div>
              <div className="font-mono text-xs text-text truncate mt-0.5">{shareUrl}</div>
            </div>
            <button
              onClick={handleCopyLink}
              className="btn-secondary !py-1.5 !px-3 text-xs shrink-0 flex items-center gap-1.5 w-full sm:w-auto justify-center"
            >
              {copiedLink ? <Check size={14} className="text-easy" /> : <Copy size={14} />}
              <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
