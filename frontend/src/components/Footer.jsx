import React from "react";
import { Link } from "react-router-dom";
import { GitMerge, Github, Cpu, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-surface/10 pt-16 pb-8 px-6 mt-20 relative overflow-hidden">
      {/* Subtle backdrop glow */}
      <div className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 h-40 w-[600px] rounded-full bg-accent/3 blur-3xl" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Main 4-Column Layout */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-border/40">
          {/* Brand Column (Span 2 on desktop) */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2 font-display font-semibold text-text text-base">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent shadow-[0_0_15px_rgba(76,141,255,0.15)] animate-pulse">
                <GitMerge size={18} />
              </span>
              CodeMerge
            </div>
            <p className="text-xs text-muted leading-relaxed max-w-sm">
              All your coding profiles, handles, and solved counts merged into
              one unified developer graph. Level up your practice with
              AI-generated roadmap reviews.
            </p>
            {/* Developer Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-easy/20 bg-easy/5 text-[10px] font-mono text-easy font-semibold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-easy opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-easy"></span>
              </span>
              All Systems Operational
            </div>
          </div>

          {/* Navigation Column */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-text uppercase tracking-widest font-display">
              Product
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/#features"
                  className="text-muted hover:text-accent transition-colors duration-200"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/#how-it-works"
                  className="text-muted hover:text-accent transition-colors duration-200"
                >
                  How It Works
                </a>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-muted hover:text-accent transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/link"
                  className="text-muted hover:text-accent transition-colors duration-200"
                >
                  Platform Linker
                </Link>
              </li>
            </ul>
          </div>

          {/* Platforms Column */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-text uppercase tracking-widest font-display">
              Integrations
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li className="flex items-center gap-1">
                LeetCode{" "}
                <span className="text-[9px] text-accent/80 font-mono">
                  Auto
                </span>
              </li>
              <li className="flex items-center gap-1">
                Codeforces{" "}
                <span className="text-[9px] text-accent/80 font-mono">
                  Auto
                </span>
              </li>
              <li className="flex items-center gap-1">
                GeeksforGeeks{" "}
                <span className="text-[9px] text-accent/80 font-mono">
                  Auto
                </span>
              </li>
              <li className="flex items-center gap-1">
                CodeChef{" "}
                <span className="text-[9px] text-accent/80 font-mono">
                  Auto
                </span>
              </li>
              <li className="flex items-center gap-1">
                Hackerank{" "}
                <span className="text-[9px] text-accent/80 font-mono">
                  Auto
                </span>
              </li>
              <li className="flex items-center gap-1">
                Github{" "}
                <span className="text-[9px] text-accent/80 font-mono">
                  Auto
                </span>
              </li>
            </ul>
          </div>

          {/* Company/Support Column */}
          <div className="space-y-3 col-span-2 md:col-span-1">
            <h4 className="text-[10px] font-bold text-text uppercase tracking-widest font-display">
              Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/#contact"
                  className="text-muted hover:text-accent transition-colors duration-200"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-muted hover:text-accent transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted hover:text-accent transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Github */}
        <div className="flex flex-col gap-4 pt-8 md:flex-row md:items-center md:justify-between text-muted">
          <p className="text-[11px] font-mono leading-relaxed">
            © {new Date().getFullYear()} CodeMerge. All rights reserved. Created
            for competitive programming & algorithmic practice tracking.
          </p>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1 text-[10px] text-muted/60">
              Built with{" "}
              <Heart size={10} className="text-hard fill-hard animate-pulse" />{" "}
              for devs
            </span>
            <hr className="w-px h-3 border-none bg-border/50" />
            <a
              href="https://github.com/amanmishra2005/CodeMerge"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-muted hover:text-text transition-colors duration-200"
            >
              <Github size={14} /> Repository
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
