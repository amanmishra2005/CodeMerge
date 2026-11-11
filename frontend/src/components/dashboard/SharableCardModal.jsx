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
} from 'lucide-react';

const CARD_THEMES = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    bg: 'linear-gradient(135deg, #0b0f19 0%, #17112c 50%, #0d1b2a 100%)',
    border: 'rgba(168, 85, 247, 0.4)',
    accent: '#a855f7',
    accent2: '#06b6d4',
    glow: 'rgba(168, 85, 247, 0.3)',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Cobalt',
    bg: 'linear-gradient(135deg, #07090e 0%, #0f172a 50%, #081226 100%)',
    border: 'rgba(76, 141, 255, 0.4)',
    accent: '#4C8DFF',
    accent2: '#38bdf8',
    glow: 'rgba(76, 141, 255, 0.3)',
  },
  {
    id: 'gold',
    name: 'Grandmaster Gold',
    bg: 'linear-gradient(135deg, #0d0c07 0%, #201a0a 50%, #151105 100%)',
    border: 'rgba(255, 180, 84, 0.45)',
    accent: '#FFB454',
    accent2: '#f59e0b',
    glow: 'rgba(255, 180, 84, 0.35)',
  },
  {
    id: 'matrix',
    name: 'Terminal Matrix',
    bg: 'linear-gradient(135deg, #050d09 0%, #0b1f14 50%, #04120a 100%)',
    border: 'rgba(61, 220, 132, 0.4)',
    accent: '#3DDC84',
    accent2: '#10b981',
    glow: 'rgba(61, 220, 132, 0.3)',
  },
];

export default function SharableCardModal({ isOpen, onClose, ranking, totals, user, platforms }) {
  const [selectedTheme, setSelectedTheme] = useState(CARD_THEMES[0]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const cardRef = useRef(null);
  const canvasRef = useRef(null);

  if (!isOpen) return null;

  const r = ranking || {
    score: 0,
    tier: { name: 'Apprentice', title: 'Code Apprentice', color: '#8B96AD', badge: '🌱' },
    percentile: 80,
    estimatedRank: 500,
    breakdown: { totalSolved: 0, dsaPoints: 0, githubPoints: 0, maxContestRating: 0 },
  };

  const t = totals || { totalSolved: 0, easy: 0, medium: 0, hard: 0 };
  const tier = r.tier || {};
  const breakdown = r.breakdown || {};
  const userName = user?.name || 'CodeMerge Developer';
  const userHandle = user?.email ? user.email.split('@')[0] : 'developer';

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/${user?._id || userHandle}`
    : `https://codemerge.dev/share/${userHandle}`;

  const shareText = `🚀 My verified @CodeMerge Developer Rank:\n🔥 MergeScore: ${r.score.toLocaleString()} (${tier.name} Tier)\n🏆 Top ${r.percentile}% Globally • ${t.totalSolved} Problems Solved\nCheck your merged coding stats: ${shareUrl}`;

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

  // Draw high-res 2400x1350 canvas for crystal-clear export
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const width = 1200;
    const height = 675;

    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (selectedTheme.id === 'cyberpunk') {
      bgGrad.addColorStop(0, '#0b0f19');
      bgGrad.addColorStop(0.5, '#17112c');
      bgGrad.addColorStop(1, '#0d1b2a');
    } else if (selectedTheme.id === 'gold') {
      bgGrad.addColorStop(0, '#0d0c07');
      bgGrad.addColorStop(0.5, '#201a0a');
      bgGrad.addColorStop(1, '#151105');
    } else if (selectedTheme.id === 'matrix') {
      bgGrad.addColorStop(0, '#050d09');
      bgGrad.addColorStop(0.5, '#0b1f14');
      bgGrad.addColorStop(1, '#04120a');
    } else {
      bgGrad.addColorStop(0, '#07090e');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#081226');
    }
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

    // 3. Border Stroke
    ctx.strokeStyle = selectedTheme.border;
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    // 4. Header Bar: Logo & Branding
    ctx.fillStyle = selectedTheme.accent;
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('⚡ CodeMerge', 45, 60);

    ctx.fillStyle = '#8B96AD';
    ctx.font = '600 13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('VERIFIED DEVELOPER SCORECARD', width - 290, 60);

    // 5. User Information
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(userName, 45, 125);

    ctx.fillStyle = '#8B96AD';
    ctx.font = '500 16px monospace';
    ctx.fillText(`@${userHandle} • Omni-Platform Engineer`, 45, 155);

    // 6. Tier Badge Pill
    ctx.fillStyle = `${tier.color || selectedTheme.accent}25`;
    ctx.strokeStyle = tier.color || selectedTheme.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(45, 185, 230, 42, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = tier.color || selectedTheme.accent;
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`${tier.badge || '👑'}  ${tier.name} Tier`, 65, 212);

    // Percentile Pill
    ctx.fillStyle = 'rgba(76, 141, 255, 0.15)';
    ctx.strokeStyle = 'rgba(76, 141, 255, 0.4)';
    ctx.beginPath();
    ctx.roundRect(290, 185, 210, 42, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4C8DFF';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`📈  Top ${r.percentile}% Worldwide`, 310, 212);

    // 7. Large Score Section (Right Side)
    ctx.fillStyle = '#8B96AD';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('MERGESCORE™', width - 340, 140);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 68px monospace';
    ctx.fillText(r.score.toLocaleString(), width - 340, 210);

    ctx.fillStyle = selectedTheme.accent;
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`GLOBAL RANK #${r.estimatedRank.toLocaleString()}`, width - 340, 238);

    // 8. Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(45, 260);
    ctx.lineTo(width - 45, 260);
    ctx.stroke();

    // 9. Metrics Grid Cards
    const metrics = [
      { label: 'TOTAL SOLVED', val: t.totalSolved.toLocaleString(), color: '#4C8DFF' },
      { label: 'EASY SOLVED', val: (t.easy || 0).toLocaleString(), color: '#3DDC84' },
      { label: 'MEDIUM SOLVED', val: (t.medium || 0).toLocaleString(), color: '#FFB454' },
      { label: 'HARD SOLVED', val: (t.hard || 0).toLocaleString(), color: '#FF5C5C' },
      { label: 'GITHUB COMMITS', val: (breakdown.githubCommits || 0).toLocaleString(), color: '#38bdf8' },
      { label: 'BEST CONTEST MMR', val: (breakdown.maxContestRating || 0).toLocaleString(), color: '#a855f7' },
    ];

    const cardW = 170;
    const cardH = 88;
    const startX = 45;
    const gapX = 18;
    const startY = 285;

    metrics.forEach((m, idx) => {
      const col = idx % 6;
      const x = startX + col * (cardW + gapX);
      const y = startY;

      // Card box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, cardW, cardH, 10);
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = '#8B96AD';
      ctx.font = '600 10px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(m.label, x + 14, y + 26);

      // Value
      ctx.fillStyle = m.color;
      ctx.font = 'bold 24px monospace';
      ctx.fillText(m.val, x + 14, y + 62);
    });

    // 10. Platform Pills Bar
    ctx.fillStyle = '#8B96AD';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('CONNECTED PLATFORMS:', 45, 420);

    const platList = (platforms || []).map((p) => p.platform || 'Platform');
    const platNames = platList.length > 0 ? platList : ['LeetCode', 'Codeforces', 'GitHub', 'GeeksforGeeks'];

    let pX = 220;
    platNames.forEach((pName) => {
      const pW = ctx.measureText(pName).width + 36;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(pX, 402, pW, 26, 13);
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

    const barX = 45;
    const barY = 460;
    const barW = width - 90;
    const barH = 14;

    ctx.fillStyle = '#131B2E';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 7);
    ctx.fill();

    // Easy portion
    ctx.fillStyle = '#3DDC84';
    ctx.beginPath();
    ctx.roundRect(barX, barY, Math.max(8, barW * easyRatio), barH, [7, 0, 0, 7]);
    ctx.fill();

    // Medium portion
    ctx.fillStyle = '#FFB454';
    ctx.fillRect(barX + barW * easyRatio, barY, barW * medRatio, barH);

    // Hard portion
    ctx.fillStyle = '#FF5C5C';
    ctx.beginPath();
    ctx.roundRect(barX + barW * (easyRatio + medRatio), barY, Math.max(8, barW * hardRatio), barH, [0, 7, 7, 0]);
    ctx.fill();

    // 12. Footer Watermark
    ctx.fillStyle = '#8B96AD';
    ctx.font = '500 13px monospace';
    ctx.fillText(`🔗 Verify & Track your rank at codemerge.dev/share/${userHandle}`, 45, 630);

    ctx.fillStyle = selectedTheme.accent;
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('#CodeMerge', width - 145, 630);

    return canvas;
  };

  useEffect(() => {
    renderCanvas();
  }, [selectedTheme, ranking, totals, user, platforms]);

  // Download Card as PNG Image
  const handleDownload = () => {
    setDownloading(true);
    const canvas = renderCanvas();
    if (!canvas) {
      setDownloading(false);
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `codemerge-${userHandle}-rank.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloading(false);
  };

  // Copy Image directly to Clipboard
  const handleCopyImage = async () => {
    const canvas = renderCanvas();
    if (!canvas || !navigator.clipboard?.write) return;
    try {
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

  const tweetIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const linkedInIntent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const whatsAppIntent = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-ink/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card relative w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-border shadow-2xl bg-surface/95"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Sparkles size={18} />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-text">CodeMerge Social Card Studio</h3>
              <p className="text-xs text-muted">Generate & export high-res scorecard for Twitter, LinkedIn, Discord</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Theme Selector Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Choose Style Theme:</span>
            <div className="flex flex-wrap items-center gap-2">
              {CARD_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedTheme.id === theme.id
                      ? 'border-2 text-text shadow-md'
                      : 'border border-border/70 text-muted hover:text-text hover:bg-surface2'
                  }`}
                  style={{
                    borderColor: selectedTheme.id === theme.id ? theme.accent : undefined,
                    backgroundColor: selectedTheme.id === theme.id ? `${theme.accent}15` : undefined,
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

          {/* Live Card Preview (Hidden Canvas + Scaled View) */}
          <div className="relative rounded-2xl overflow-hidden border border-border/90 shadow-2xl bg-ink p-1">
            <canvas
              ref={canvasRef}
              className="w-full h-auto rounded-xl block object-contain shadow-inner"
              style={{ maxHeight: '420px' }}
            />
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
                <span>Download PNG</span>
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

