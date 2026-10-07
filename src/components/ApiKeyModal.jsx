import React, { useState } from 'react';
import { Key, X, ExternalLink, Check, ShieldCheck, Info } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey } from '../services/geminiService';

export default function ApiKeyModal({ isOpen, onClose, onKeySaved }) {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKey);
    setStatusMsg('Saved to local storage!');
    if (onKeySaved) onKeySaved(apiKey);
    setTimeout(() => {
      setStatusMsg('');
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setStoredApiKey('');
    setApiKey('');
    setStatusMsg('API key removed. Using built-in ATS engine.');
    if (onKeySaved) onKeySaved('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem' }}>
            <Key size={18} color="var(--primary)" />
            <span>Google Gemini API Key</span>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.45' }}>
          By adding your Google Gemini API key, you unlock deep generative re-writing powered by <strong>gemini-2.5-flash</strong>.
        </div>

        <div style={{ background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.15rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
          <Info size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>No API Key? No problem!</strong> CV Tailor includes an offline <em>Smart ATS Heuristic Engine</em> that analyzes keywords, scores compliance, and rewrites bullet points immediately with zero setup.
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Gemini API Key</span>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}
            >
              Get free key <ExternalLink size={12} />
            </a>
          </label>
          <input 
            type="password"
            className="form-input" 
            placeholder="AIzaSy..."
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          <ShieldCheck size={14} color="var(--success)" />
          <span>Your key is stored strictly in your browser's LocalStorage and never sent to any 3rd party backend.</span>
        </div>

        {statusMsg && (
          <div style={{ color: 'var(--success)', fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Check size={14} />
            <span>{statusMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          {apiKey && (
            <button className="btn btn-secondary" onClick={handleClear} style={{ color: 'var(--danger)' }}>
              Clear Key
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}
