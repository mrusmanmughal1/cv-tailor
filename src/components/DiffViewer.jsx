import React from 'react';
import { Sparkles, ArrowRight, CheckCheck, Lightbulb } from 'lucide-react';

export default function DiffViewer({ diffs = [], engine = 'Smart ATS Tailor' }) {
  if (!diffs || diffs.length === 0) {
    return (
      <div className="panel-card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No modifications generated yet. Click "Tailor CV with AI" to optimize bullet points and summary.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-card" style={{ marginBottom: '1.5rem' }}>
      <div className="panel-header">
        <div className="panel-title">
          <Sparkles size={20} color="var(--primary)" />
          <span>Tailoring Audit Log ({diffs.length} Optimizations)</span>
        </div>
        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '4px', fontWeight: 600 }}>
          {engine}
        </span>
      </div>

      <div style={{ maxHeight: '520px', overflowY: 'auto', paddingRight: '0.4rem' }}>
        {diffs.map((diff, idx) => (
          <div key={idx} className="diff-item">
            <div className="diff-header">
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                {diff.section}
              </span>
              <span className="diff-badge">{diff.type}</span>
            </div>

            {diff.reason && (
              <div className="diff-reason" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lightbulb size={13} color="var(--warning)" />
                <span>{diff.reason}</span>
              </div>
            )}

            <div className="diff-box">
              <div className="diff-orig">
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '0.25rem' }}>
                  BEFORE (ORIGINAL)
                </div>
                <div>{diff.original}</div>
              </div>

              <div className="diff-new">
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.25rem' }}>
                  AFTER (ATS OPTIMIZED)
                </div>
                <div>{diff.tailored}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
