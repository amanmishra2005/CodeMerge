import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, BrainCircuit, ShieldAlert, Cpu, Award, Zap, Compass, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import api from '../api/axios.js';

// Typewriter hook to stream text
function useTypewriter(text, speed = 8) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      return;
    }
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayedText;
}

export default function AIAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [scanningStep, setScanningStep] = useState(0);
  const navigate = useNavigate();

  const scanningMessages = [
    'Opening profile analyzer...',
    'Reviewing your total solved counts...',
    'Checking difficulty proportions...',
    'Comparing with general interview standards...',
    'Drafting tailored mentor tips...',
    'Finalizing your report...'
  ];

  const fetchAnalysis = async (isRetry = false) => {
    setLoading(true);
    setError('');
    setScanningStep(0);
    setFeedback('');

    // Simulate scanning steps
    const interval = setInterval(() => {
      setScanningStep((prev) => {
        if (prev < scanningMessages.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 800);

    try {
      const res = await api.post('/feedback/analyze');
      setFeedback(res.data.feedback || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not compile analysis at this time.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const typedFeedback = useTypewriter(feedback, 6);

  // Group text into paragraphs
  const paragraphs = typedFeedback.split('\n\n').filter(Boolean);

  return (
    <div className="min-h-screen bg-ink flex flex-col justify-between overflow-hidden relative">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-accent2/5 blur-[100px] pointer-events-none" />

      <Navbar />

      <main className="mx-auto w-full max-w-4xl px-6 py-10 flex-grow relative z-10 flex flex-col">
        {/* Navigation header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-muted hover:text-text transition-colors duration-200"
          >
            <ArrowLeft size={16} /> Back to dashboard
          </button>
        </div>

        {/* Header Title */}
        <div className="mb-8">
          <span className="eyebrow flex items-center gap-2">
            <BrainCircuit size={12} /> Cognitive Profiler
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold text-text md:text-4xl">
            AI Profile Analysis
          </h1>
          <p className="mt-2 text-sm text-muted">
            Our AI Mentor reviews your combined stats to highlight your coding strengths, identify topic gaps, and suggest target concepts.
          </p>
        </div>

        {/* Interactive Analyzer Window */}
        <div className="flex-grow flex flex-col justify-center items-center">
          <AnimatePresence mode="wait">
            {loading ? (
              /* SCANNING INTERFACE */
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border border-accent/20 bg-surface/80 backdrop-blur-md"
              >
                {/* Rotating scanning radar graphic */}
                <div className="relative mb-8 flex h-36 w-36 items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border border-dashed border-accent/30"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                    className="absolute inset-3 rounded-full border-t-2 border-b-2 border-accent"
                  />
                  <div className="absolute inset-6 rounded-full bg-ink/80 flex items-center justify-center text-accent">
                    <Cpu size={40} className="animate-pulse" />
                  </div>
                </div>

                {/* Loading State Messages */}
                <h3 className="font-display text-lg font-bold text-text mb-2">
                  Scanning Coding DNA
                </h3>
                <motion.p
                  key={scanningStep}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-mono text-sm text-accent h-6"
                >
                  {scanningMessages[scanningStep]}
                </motion.p>
              </motion.div>
            ) : error ? (
              /* ERROR INTERFACE */
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md card p-6 text-center border-hard/30 bg-hard/5 flex flex-col items-center"
              >
                <ShieldAlert size={48} className="text-hard mb-4" />
                <h3 className="font-display text-lg font-bold text-text">Analysis Interrupted</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {error}
                </p>
                <button
                  onClick={() => fetchAnalysis(true)}
                  className="mt-6 btn-primary flex items-center gap-2"
                >
                  <RefreshCw size={16} /> Try Re-analyzing
                </button>
              </motion.div>
            ) : (
              /* COMPLETED DETAILED REVIEW CARD */
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className="w-full card p-6 sm:p-8 border border-border/80 bg-surface/90 backdrop-blur-lg relative"
              >
                {/* Floating graphic overlay */}
                <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-accent2/10 blur-2xl" />

                {/* Section header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Sparkles size={20} />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-text">Mentor Report</h3>
                      <span className="text-[10px] text-muted font-mono uppercase tracking-widest">Cognitive synthesis</span>
                    </div>
                  </div>
                  <button
                    onClick={() => fetchAnalysis(true)}
                    className="p-2.5 rounded-xl border border-border bg-surface2 hover:text-accent hover:border-accent transition-all duration-200"
                    title="Regenerate Report"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>

                {/* Streaming custom content layout */}
                <div className="space-y-6">
                  {paragraphs.map((p, index) => {
                    // Highlight sections depending on paragraph content
                    let icon = Compass;
                    let title = "General Insights";
                    let cardColor = "border-border/40 bg-surface/20";
                    let textColor = "text-accent";

                    if (p.toLowerCase().includes('recommend') || p.toLowerCase().includes('next steps') || p.toLowerCase().includes('1.')) {
                      icon = Award;
                      title = "Path Recommendations";
                      cardColor = "border-accent2/20 bg-accent2/5";
                      textColor = "text-accent2";
                    } else if (index === 0) {
                      icon = Zap;
                      title = "Assessment & Strengths";
                      cardColor = "border-easy/20 bg-easy/5";
                      textColor = "text-easy";
                    }

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className={`border rounded-2xl p-5 ${cardColor}`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`${textColor}`}>
                            {React.createElement(icon, { size: 18 })}
                          </span>
                          <span className={`text-xs font-mono font-bold uppercase tracking-wider ${textColor}`}>
                            {title}
                          </span>
                        </div>
                        <p className="text-sm text-text leading-relaxed whitespace-pre-line font-body">
                          {p}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
