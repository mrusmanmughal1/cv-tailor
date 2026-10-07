import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Palette, 
  Type, 
  Layers, 
  FileCheck2,
  Sparkles
} from 'lucide-react';

export default function CvPreview({ cv, template = 'classic', setTemplate }) {
  const [copied, setCopied] = useState(false);
  const [fontFamily, setFontFamily] = useState('sans'); // 'sans' | 'serif' | 'modern'
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [isCompact, setIsCompact] = useState(true);
  const [skillsStyle, setSkillsStyle] = useState('pills'); // 'pills' | 'text'

  if (!cv || !cv.personalInfo) {
    return (
      <div className="panel-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No CV loaded. Please upload or load demo CV.</p>
      </div>
    );
  }

  const { personalInfo, summary, experience = [], skills = [], education = [], certifications = [], projects = [] } = cv;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    let fullText = `${personalInfo.fullName}\n${personalInfo.jobTitle}\n`;
    fullText += `${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}\n\n`;
    fullText += `PROFESSIONAL SUMMARY\n${summary}\n\n`;
    fullText += `TECHNICAL SKILLS\n${skills.join(', ')}\n\n`;
    fullText += `WORK EXPERIENCE\n`;
    experience.forEach(exp => {
      fullText += `${exp.role} - ${exp.company} (${exp.startDate} - ${exp.endDate})\n`;
      (exp.bullets || []).forEach(b => {
        fullText += `• ${b}\n`;
      });
      fullText += '\n';
    });
    fullText += `EDUCATION\n`;
    education.forEach(edu => {
      fullText += `${edu.degree}, ${edu.institution} (${edu.graduationYear})\n`;
    });

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cv, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${personalInfo.fullName.replace(/\s+/g, '_')}_Tailored_CV.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div>
      {/* Preview Control Toolbar */}
      <div className="panel-card preview-toolbar" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
          
          {/* Template Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TEMPLATE:</span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button 
                className={`btn btn-secondary ${template === 'classic' ? 'btn-primary' : ''}`}
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                onClick={() => { setTemplate('classic'); setFontFamily('serif'); }}
              >
                Classic
              </button>
              <button 
                className={`btn btn-secondary ${template === 'modern' ? 'btn-primary' : ''}`}
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                onClick={() => { setTemplate('modern'); setFontFamily('modern'); }}
              >
                Modern
              </button>
              <button 
                className={`btn btn-secondary ${template === 'executive' ? 'btn-primary' : ''}`}
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                onClick={() => { setTemplate('executive'); setFontFamily('sans'); }}
              >
                Executive
              </button>
            </div>
          </div>

          {/* Spacing Density */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SPACING:</span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button 
                className={`btn btn-secondary ${isCompact ? 'btn-primary' : ''}`}
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                onClick={() => setIsCompact(true)}
                title="Compact spacing to fit more content per page without empty gaps"
              >
                Compact
              </button>
              <button 
                className={`btn btn-secondary ${!isCompact ? 'btn-primary' : ''}`}
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                onClick={() => setIsCompact(false)}
                title="Standard relaxed spacing"
              >
                Standard
              </button>
            </div>
          </div>

          {/* Skills Layout Style */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SKILLS:</span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button 
                className={`btn btn-secondary ${skillsStyle === 'pills' ? 'btn-primary' : ''}`}
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                onClick={() => setSkillsStyle('pills')}
              >
                Badges
              </button>
              <button 
                className={`btn btn-secondary ${skillsStyle === 'text' ? 'btn-primary' : ''}`}
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                onClick={() => setSkillsStyle('text')}
                title="Inline text uses much less vertical space"
              >
                Inline Text
              </button>
            </div>
          </div>

          {/* Accent Color Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>COLOR:</span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {['#2563eb', '#0f172a', '#059669', '#7c3aed', '#b91c1c'].map(color => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: color,
                    border: accentColor === color ? '2px solid #ffffff' : 'none',
                    outline: accentColor === color ? `2px solid ${color}` : 'none',
                    cursor: 'pointer'
                  }}
                  title={`Select ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Action Export Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
              onClick={handleCopyText}
              title="Copy plain ATS text to clipboard"
            >
              {copied ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button 
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
              onClick={handleDownloadJson}
              title="Save CV data as JSON"
            >
              <Download size={13} />
              <span>JSON</span>
            </button>

            <button 
              className="btn btn-primary"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: 700 }}
              onClick={handlePrint}
              title="Print or Save as Vector ATS-compliant PDF"
            >
              <Printer size={15} />
              <span>Download ATS PDF</span>
            </button>
          </div>

        </div>
      </div>

      {/* Real Live Paper Preview Area */}
      <div className="preview-stage">
        <div 
          id="printable-cv"
          className={`resume-paper template-${template} ${isCompact ? 'compact' : ''}`}
          style={{
            '--paper-accent': accentColor,
            fontFamily: fontFamily === 'serif' ? 'var(--font-serif)' : fontFamily === 'modern' ? 'var(--font-sans)' : 'var(--font-body)',
            padding: isCompact ? '1.5rem 2rem' : '2.4rem 2.8rem'
          }}
        >
          {/* Header Section */}
          <header className="resume-header">
            <h1 className="resume-name" style={{ color: accentColor === '#0f172a' ? '#111827' : accentColor }}>
              {personalInfo.fullName || 'Candidate Name'}
            </h1>
            <div className="resume-title">
              {personalInfo.jobTitle || 'Professional Title'}
            </div>
            <div className="resume-contacts">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && (
                <>
                  <span className="separator">•</span>
                  <span>{personalInfo.phone}</span>
                </>
              )}
              {personalInfo.location && (
                <>
                  <span className="separator">•</span>
                  <span>{personalInfo.location}</span>
                </>
              )}
              {personalInfo.linkedin && (
                <>
                  <span className="separator">•</span>
                  <a href={`https://${personalInfo.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer">
                    {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </>
              )}
              {personalInfo.github && (
                <>
                  <span className="separator">•</span>
                  <a href={`https://${personalInfo.github.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer">
                    {personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </>
              )}
            </div>
          </header>

          {/* Professional Summary */}
          {summary && (
            <section className="resume-section">
              <h2 className="resume-section-title">
                Professional Summary
              </h2>
              <p className="resume-summary-text">
                {summary}
              </p>
            </section>
          )}

          {/* Technical & Professional Skills */}
          {skills && skills.length > 0 && (
            <section className="resume-section">
              <h2 className="resume-section-title">
                Core Competencies & Technical Skills
              </h2>
              {skillsStyle === 'text' ? (
                <p className="resume-skills-text">
                  {skills.join(' • ')}
                </p>
              ) : (
                <div className="resume-skills-grid">
                  {skills.map((skill, idx) => (
                    <span key={idx} className="resume-skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Work Experience */}
          {experience && experience.length > 0 && (
            <section className="resume-section">
              <h2 className="resume-section-title">
                Professional Experience
              </h2>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="resume-item">
                  <div className="resume-item-header">
                    <div>
                      <span className="resume-item-title">{exp.role}</span>
                      <span style={{ margin: '0 6px', color: '#9ca3af' }}>|</span>
                      <span className="resume-item-company">{exp.company}</span>
                    </div>
                    <div className="resume-item-date">
                      {exp.startDate} – {exp.endDate || 'Present'}
                    </div>
                  </div>
                  {exp.location && (
                    <div className="resume-item-location">{exp.location}</div>
                  )}
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="resume-bullets">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <section className="resume-section">
              <h2 className="resume-section-title">
                Education
              </h2>
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="resume-item">
                  <div className="resume-item-header">
                    <div>
                      <span className="resume-item-title">{edu.degree}</span>
                      <span style={{ margin: '0 6px', color: '#9ca3af' }}>|</span>
                      <span className="resume-item-company">{edu.institution}</span>
                    </div>
                    <div className="resume-item-date">{edu.graduationYear}</div>
                  </div>
                  {edu.honors && (
                    <div style={{ fontSize: '0.8rem', color: '#4b5563', fontStyle: 'italic', marginTop: '2px' }}>
                      {edu.honors}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <section className="resume-section">
              <h2 className="resume-section-title">
                Certifications & Credentials
              </h2>
              <ul className="resume-bullets">
                {certifications.map((cert, idx) => (
                  <li key={idx}><strong>{cert}</strong></li>
                ))}
              </ul>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section className="resume-section">
              <h2 className="resume-section-title">
                Key Engineering Projects
              </h2>
              {projects.map((proj, idx) => (
                <div key={proj.id || idx} className="resume-item">
                  <div className="resume-item-header">
                    <span className="resume-item-title">{proj.name}</span>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' }}>
                      {proj.technologies}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#374151', marginTop: '3px' }}>
                    {proj.description}
                  </p>
                </div>
              ))}
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
