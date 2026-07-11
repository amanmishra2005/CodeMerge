import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, RefreshCw } from 'lucide-react';
import api from '../../api/axios.js';

const platformMeta = [
  { key: 'leetcode', label: 'LeetCode', color: '#FFB454', placeholder: 'e.g. ada_lovelace' },
  { key: 'codeforces', label: 'Codeforces', color: '#4C8DFF', placeholder: 'e.g. tourist' },
  { key: 'gfg', label: 'GeeksforGeeks', color: '#3DDC84', placeholder: 'e.g. adaL1' },
  { key: 'hackerrank', label: 'HackerRank', color: '#FF5C5C', placeholder: 'e.g. ada_lovelace' },
];

export default function PlatformLinker({ initialPlatforms, onSaved }) {
  const [form, setForm] = useState({
    leetcode: initialPlatforms?.leetcode?.username || '',
    codeforces: initialPlatforms?.codeforces?.username || '',
    gfg: initialPlatforms?.gfg?.username || '',
    hackerrank: initialPlatforms?.hackerrank?.username || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/stats/platforms', form);
      const res = await api.get('/stats/refresh');
      setMessage('Saved and refreshed!');
      onSaved && onSaved(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save platforms.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card p-6"
    >
      <div className="mb-5 flex items-center gap-2">
        <Link2 size={18} className="text-accent" />
        <h2 className="font-display text-lg font-semibold text-text">Linked platforms</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {platformMeta.map((p) => (
          <div key={p.key}>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.label}
            </label>
            <input
              value={form[p.key]}
              onChange={(e) => handleChange(p.key, e.target.value)}
              placeholder={p.placeholder}
              className="input-field"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? (
            <>
              <RefreshCw size={16} className="animate-spin" /> Refreshing...
            </>
          ) : (
            <>
              <RefreshCw size={16} /> Save & refresh stats
            </>
          )}
        </button>
        {message && <span className="text-sm text-muted">{message}</span>}
      </div>
    </motion.form>
  );
}
