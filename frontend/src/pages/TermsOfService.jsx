import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink flex flex-col justify-between overflow-hidden relative">
      {/* Decorative glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-accent2/3 blur-[100px] pointer-events-none" />

      <Navbar />

      <main className="mx-auto w-full max-w-3xl px-6 py-10 flex-grow relative z-10">
        {/* Back Link */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted hover:text-text transition-colors duration-200"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Document Header */}
        <div className="mb-10">
          <span className="eyebrow flex items-center gap-2">
            <Shield size={12} /> legal information
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold text-text md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs font-mono text-muted">
            Last Updated: July 12, 2026
          </p>
        </div>

        {/* Document Body */}
        <div className="card p-6 sm:p-8 space-y-6 border border-border/80 bg-surface/90 backdrop-blur-md text-sm text-muted leading-relaxed font-body">
          <section className="space-y-2">
            <h3 className="font-display font-semibold text-text text-base">1. Acceptance of Terms</h3>
            <p>
              By registering an account or using the CodeMerge stats aggregation services, you agree to be bound by these Terms of Service. If you do not agree, please do not access or use the platform.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display font-semibold text-text text-base">2. Account Registration & Security</h3>
            <p>
              You must provide accurate information when registering an account. You are solely responsible for maintaining the confidentiality of your credentials (including your password and web tokens) and for all activity logged under your account.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display font-semibold text-text text-base">3. Platform Services & Third-Party APIs</h3>
            <p>
              CodeMerge is a profile statistics consolidation utility. It fetches public, community-facing user profile information from platforms including LeetCode, Codeforces, GeeksforGeeks, CodeChef, and AtCoder. We do not control these third-party platforms, and are not responsible for any changes, API rate-limits, or structural adjustments they apply that could affect statistic sync availability.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display font-semibold text-text text-base">4. Acceptable Use</h3>
            <p>
              You agree not to attempt to disrupt the servers, spoof other developers' accounts, or crawl the platform APIs excessively. All stats scraping triggered from your account must belong to profiles you own or have explicit rights to reference.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display font-semibold text-text text-base">5. Termination</h3>
            <p>
              We reserve the right to suspend or block your profile access at any time, with or without notice, for conduct that violates these terms or is harmful to other platform users.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display font-semibold text-text text-base">6. Liability Limitations</h3>
            <p>
              CodeMerge is provided on an "as-is" and "as-available" basis without warranties of any kind. Under no circumstances shall CodeMerge or its maintainers be liable for any data loss, server downtime, or inaccurate stats calculations.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
