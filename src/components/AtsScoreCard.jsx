import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Target, 
  FileCheck, 
  PlusCircle, 
  Sparkles,
  Award
} from 'lucide-react';

export default function AtsScoreCard({ 
  analysis, 
  onAddMissingSkill, 
  onTriggerTailor, 
  isTailoring 
}) {
  if (!analysis) return null;

  const {
    overallScore = 0,
    keywordMatchRate = 0,
    impactScore = 0,
    formattingScore = 0,
    matchedKeywords = [],
    missingKeywords = [],
    matchedCount = 0,
    totalKeywordsCount = 0,
    metricsFoundCount = 0,
    totalBulletsCount = 0,
    checks = []
  } = analysis;

  // Gauge calculations
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return { label: 'High ATS Pass Probability', class: 'status-high' };
    if (score >= 60) return { label: 'Moderate ATS Compatibility', class: 'status-med' };
    return { label: 'At Risk - Low Keyword Match', class: 'status-low' };
  };

  const status = getScoreStatus(overallScore);

  return (
    <div className="panel-card" style={{ marginBottom: '1.5rem' }}>
      {/* ATS Hero Header with Score Meter */}
      <div className="ats-hero">
        <div className="score-display-group">
          <div className="score-circle">
            <svg viewBox="0 0 84 84">
              <circle className="bg-ring" cx="42" cy="42" r={radius} />
              <circle
                className="progress-ring"
                cx="42"
                cy="42"
                r={radius}
                style={{
                  stroke: getScoreColor(overallScore),
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset
                }}
              />
            </svg>
            <div className="score-text-inner">
              <span className="score-number" style={{ color: getScoreColor(overallScore) }}>
                {overallScore}
              </span>
              <span className="score-pct">ATS SCORE</span>
            </div>
          </div>

          <div className="score-meta">
            <h4>ATS Compatibility Analysis</h4>
            <div className={`score-badge-status ${status.class}`}>
              <Award size={13} />
              <span>{status.label}</span>
            </div>
          </div>
        </div>

        {/* Quick Tailor CTA if score is suboptimal */}
        {overallScore < 85 && (
          <button 
            className="btn btn-primary"
            onClick={onTriggerTailor}
            disabled={isTailoring}
          >
            <Sparkles size={16} />
            <span>{isTailoring ? 'Optimizing...' : 'Boost Score with AI Tailor'}</span>
          </button>
        )}
      </div>

      {/* 3 Core Metric Meters */}
      <div className="metrics-row">
        {/* 1. Keyword Match */}
        <div className="metric-stat-card">
          <div className="label">KEYWORD MATCH RATE</div>
          <div className="val">
            <span>{keywordMatchRate}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {matchedCount}/{totalKeywordsCount} Matched
            </span>
          </div>
          <div className="metric-progress-track">
            <div 
              className="metric-progress-fill" 
              style={{ width: `${keywordMatchRate}%`, background: getScoreColor(keywordMatchRate) }}
            />
          </div>
        </div>

        {/* 2. Impact & Metrics */}
        <div className="metric-stat-card">
          <div className="label">QUANTIFIABLE IMPACT (STAR)</div>
          <div className="val">
            <span>{impactScore}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {metricsFoundCount}/{totalBulletsCount} Bullets with Metrics
            </span>
          </div>
          <div className="metric-progress-track">
            <div 
              className="metric-progress-fill" 
              style={{ width: `${impactScore}%`, background: getScoreColor(impactScore) }}
            />
          </div>
        </div>

        {/* 3. Formatting & ATS Health */}
        <div className="metric-stat-card">
          <div className="label">FORMATTING & ATS HYGIENE</div>
          <div className="val">
            <span>{formattingScore}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Clean Layout
            </span>
          </div>
          <div className="metric-progress-track">
            <div 
              className="metric-progress-fill" 
              style={{ width: `${formattingScore}%`, background: getScoreColor(formattingScore) }}
            />
          </div>
        </div>
      </div>

      {/* Keywords Breakdown: Matched vs Missing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Matched Keywords */}
        <div className="keyword-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>
            <CheckCircle2 size={16} />
            <span>Matched Keywords ({matchedKeywords.length})</span>
          </div>
          <div className="keyword-chips">
            {matchedKeywords.length > 0 ? (
              matchedKeywords.map((item, idx) => (
                <span key={idx} className="chip chip-matched">
                  {item.keyword} {item.count > 1 ? `×${item.count}` : ''}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No keywords matched yet.</span>
            )}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="keyword-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)' }}>
              <XCircle size={16} />
              <span>Missing from CV ({missingKeywords.length})</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click tag to add to skills</span>
          </div>
          <div className="keyword-chips">
            {missingKeywords.length > 0 ? (
              missingKeywords.map((kw, idx) => (
                <span 
                  key={idx} 
                  className="chip chip-missing"
                  onClick={() => onAddMissingSkill && onAddMissingSkill(kw)}
                  title={`Click to add "${kw}" to CV skills`}
                >
                  <PlusCircle size={12} />
                  {kw}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>🎉 Fantastic! All target keywords found!</span>
            )}
          </div>
        </div>
      </div>

      {/* ATS Hygiene Checklist */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileCheck size={16} color="var(--primary)" />
          <span>ATS Parser Readiness Checklist</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.6rem' }}>
          {checks.map((check, idx) => (
            <div 
              key={idx} 
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.6rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem'
              }}
            >
              {check.passed ? (
                <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <div>
                <div style={{ fontWeight: 600, color: check.passed ? 'var(--text-main)' : 'var(--warning)' }}>
                  {check.title}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1px' }}>
                  {check.tip}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
