import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function PrivacyPolicy() {
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
            <Shield size={12} /> privacy & safety
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold text-text md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs font-mono text-muted">
            Last Updated: July 12, 2026
          </p>
        </div>

        {/* Document Body */}
        <div className="card p-6 sm:p-8 space-y-6 border border-border/80 bg-surface/90 backdrop-blur-md text-sm text-muted leading-relaxed font-body">
          <section className="space-y-2">
            <h3 className="font-display font-semibold text-text text-base">1. Information We Collect</h3>
            <p>
              We collect minimal personal data to run the platform services:
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li><strong>Account Credentials</strong>: Your name, email address, and a cryptographically salted password hash when creating an account.</li>
              <li><strong>Platform Handles</strong>: Usernames or profile keys you link (such as LeetCode, Codeforces, GeeksforGeeks, CodeChef, and AtCoder handles).</li>
              <li><strong>Problem Solving Statistics</strong>: Aggregated solve counts and difficulty breakdowns synced from the coding platforms or logged manually.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-display font-semibold text-text text-base">2. How We Use Your Data</h3>
            <p>
              Your data is solely used to:
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Display unified solve stats charts and platform breakdown cards on your dashboard.</li>
              <li>Allow you to request and receive personalized AI coding recommendations and roadmaps.</li>
              <li>Notify you of platform support updates or resolve contact queries you submit.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-display font-semibold text-text text-base">3. Data Sharing & Security</h3>
            <p>
              We do not sell, lease, or distribute your email or profile handles to third-party marketing networks. When compiling your AI recommendations, we send your aggregated counts (e.g. "LeetCode: 50 solved, Codeforces: 12 solved") securely to the Google Gemini API. Your email, password, and session tokens are never shared with AI models. All passwords are encrypted with bcrypt before being saved.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display font-semibold text-text text-base">4. Data Deletion</h3>
            <p>
              You can unlink handles or clear statistics from your dashboard at any time. If you wish to delete your account entirely, please contact support and your record will be completely erased from the active user index database.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display font-semibold text-text text-base">5. Changes to this Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. The updated date at the top will indicate when the changes were applied. Continued use of CodeMerge represents acceptance of the revised policy.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
