import React from 'react';
import { GitMerge } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-ink">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <div className="flex items-center gap-2 font-display font-semibold text-text">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <GitMerge size={18} />
          </span>
          CodeMerge
        </div>
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} CodeMerge. Built for developers who solve things.
        </p>
      </div>
    </footer>
  );
}
