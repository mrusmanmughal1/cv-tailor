import React, { useState } from 'react';
import { 
  User, 
  FileText, 
  Briefcase, 
  Wrench, 
  GraduationCap, 
  Award, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export default function CvEditor({ cv, setCv }) {
  const [activeSection, setActiveSection] = useState('personal'); // 'personal', 'summary', 'experience', 'skills', 'education'

  if (!cv) return null;

  // Personal Info handlers
  const handlePersonalChange = (field, value) => {
    setCv(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  // Summary handler
  const handleSummaryChange = (value) => {
    setCv(prev => ({ ...prev, summary: value }));
  };

  // Skills handlers
  const handleAddSkill = (newSkill) => {
    if (!newSkill.trim()) return;
    setCv(prev => ({
      ...prev,
      skills: Array.from(new Set([...(prev.skills || []), newSkill.trim()]))
    }));
  };

  const handleRemoveSkill = (skillToRemove) => {
    setCv(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== skillToRemove)
    }));
  };

  // Experience handlers
  const handleUpdateExperience = (idx, field, value) => {
    setCv(prev => {
      const nextExp = [...(prev.experience || [])];
      nextExp[idx] = { ...nextExp[idx], [field]: value };
      return { ...prev, experience: nextExp };
    });
  };

  const handleUpdateBullet = (expIdx, bulletIdx, value) => {
    setCv(prev => {
      const nextExp = [...(prev.experience || [])];
      const nextBullets = [...(nextExp[expIdx].bullets || [])];
      nextBullets[bulletIdx] = value;
      nextExp[expIdx].bullets = nextBullets;
      return { ...prev, experience: nextExp };
    });
  };

  const handleAddBullet = (expIdx) => {
    setCv(prev => {
      const nextExp = [...(prev.experience || [])];
      nextExp[expIdx].bullets = [...(nextExp[expIdx].bullets || []), 'Accomplished measurable results using relevant technologies.'];
      return { ...prev, experience: nextExp };
    });
  };

  const handleRemoveBullet = (expIdx, bulletIdx) => {
    setCv(prev => {
      const nextExp = [...(prev.experience || [])];
      nextExp[expIdx].bullets = nextExp[expIdx].bullets.filter((_, i) => i !== bulletIdx);
      return { ...prev, experience: nextExp };
    });
  };

  const handleAddExperience = () => {
    setCv(prev => ({
      ...prev,
      experience: [
        {
          id: `exp-${Date.now()}`,
          role: 'Role Title',
          company: 'Company Name',
          location: 'City, State',
          startDate: '2023',
          endDate: 'Present',
          current: true,
          bullets: ['Delivered key business software milestones and improved performance metrics.']
        },
        ...(prev.experience || [])
      ]
    }));
  };

  const handleRemoveExperience = (idx) => {
    setCv(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== idx)
    }));
  };

  // Skill input helper
  const [skillInput, setSkillInput] = useState('');

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div className="panel-title">
          <Wrench size={20} color="var(--primary)" />
          <span>Interactive Resume Content Editor</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Any edits instantly update the live preview and PDF output
        </span>
      </div>

      {/* Section 1: Personal Info */}
      <div style={{ marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-surface-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.85rem' }}>
          <User size={16} color="var(--primary)" />
          <span>Contact & Identification</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              className="form-input" 
              value={cv.personalInfo?.fullName || ''} 
              onChange={(e) => handlePersonalChange('fullName', e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Target Job Title</label>
            <input 
              className="form-input" 
              value={cv.personalInfo?.jobTitle || ''} 
              onChange={(e) => handlePersonalChange('jobTitle', e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              className="form-input" 
              value={cv.personalInfo?.email || ''} 
              onChange={(e) => handlePersonalChange('email', e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              className="form-input" 
              value={cv.personalInfo?.phone || ''} 
              onChange={(e) => handlePersonalChange('phone', e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input 
              className="form-input" 
              value={cv.personalInfo?.location || ''} 
              onChange={(e) => handlePersonalChange('location', e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">LinkedIn URL</label>
            <input 
              className="form-input" 
              value={cv.personalInfo?.linkedin || ''} 
              onChange={(e) => handlePersonalChange('linkedin', e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">GitHub URL</label>
            <input 
              className="form-input" 
              value={cv.personalInfo?.github || ''} 
              onChange={(e) => handlePersonalChange('github', e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Portfolio / Website</label>
            <input 
              className="form-input" 
              value={cv.personalInfo?.website || ''} 
              onChange={(e) => handlePersonalChange('website', e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Section 2: Summary */}
      <div style={{ marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-surface-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.85rem' }}>
          <FileText size={16} color="var(--primary)" />
          <span>Professional Summary</span>
        </div>
        <textarea 
          className="form-textarea" 
          rows={4}
          value={cv.summary || ''} 
          onChange={(e) => handleSummaryChange(e.target.value)}
        />
      </div>

      {/* Section 3: Skills */}
      <div style={{ marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-surface-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
            <Award size={16} color="var(--primary)" />
            <span>Technical & Professional Skills ({cv.skills?.length || 0})</span>
          </div>
        </div>

        {/* Add Skill Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <input 
            className="form-input" 
            placeholder="Add new skill (e.g. Docker, GraphQL, Kubernetes)..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill(skillInput);
                setSkillInput('');
              }
            }}
          />
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => {
              handleAddSkill(skillInput);
              setSkillInput('');
            }}
          >
            <Plus size={15} />
            <span>Add</span>
          </button>
        </div>

        {/* Skill Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
          {(cv.skills || []).map((skill, idx) => (
            <span 
              key={idx} 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--border-color)',
                fontSize: '0.8rem',
                color: 'var(--text-main)'
              }}
            >
              {skill}
              <button 
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Section 4: Work Experience */}
      <div style={{ marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-surface-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
            <Briefcase size={16} color="var(--primary)" />
            <span>Work Experience ({cv.experience?.length || 0})</span>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}
            onClick={handleAddExperience}
          >
            <Plus size={14} />
            <span>Add Role</span>
          </button>
        </div>

        {(cv.experience || []).map((exp, expIdx) => (
          <div 
            key={exp.id || expIdx}
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '1rem',
              background: 'var(--bg-surface)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                Position #{expIdx + 1}
              </span>
              <button 
                type="button" 
                className="btn-icon" 
                style={{ width: '28px', height: '28px', color: 'var(--danger)' }}
                onClick={() => handleRemoveExperience(expIdx)}
                title="Remove experience position"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label className="form-label">Job Title / Role</label>
                <input 
                  className="form-input" 
                  value={exp.role || ''} 
                  onChange={(e) => handleUpdateExperience(expIdx, 'role', e.target.value)} 
                />
              </div>
              <div>
                <label className="form-label">Company Name</label>
                <input 
                  className="form-input" 
                  value={exp.company || ''} 
                  onChange={(e) => handleUpdateExperience(expIdx, 'company', e.target.value)} 
                />
              </div>
              <div>
                <label className="form-label">Location</label>
                <input 
                  className="form-input" 
                  value={exp.location || ''} 
                  onChange={(e) => handleUpdateExperience(expIdx, 'location', e.target.value)} 
                />
              </div>
              <div>
                <label className="form-label">Dates (e.g. 2021 - Present)</label>
                <input 
                  className="form-input" 
                  value={`${exp.startDate || ''} - ${exp.endDate || ''}`} 
                  onChange={(e) => {
                    const parts = e.target.value.split('-');
                    handleUpdateExperience(expIdx, 'startDate', (parts[0] || '').trim());
                    handleUpdateExperience(expIdx, 'endDate', (parts[1] || '').trim());
                  }} 
                />
              </div>
            </div>

            {/* Bullets */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Accomplishment Bullets (STAR / XYZ formula)
                </span>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => handleAddBullet(expIdx)}
                >
                  <Plus size={12} /> Add Bullet
                </button>
              </div>

              {(exp.bullets || []).map((bullet, bulletIdx) => (
                <div key={bulletIdx} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <textarea 
                    className="form-textarea" 
                    style={{ minHeight: '52px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                    value={bullet} 
                    onChange={(e) => handleUpdateBullet(expIdx, bulletIdx, e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="btn-icon" 
                    style={{ height: '52px', width: '32px', color: 'var(--danger)', flexShrink: 0 }}
                    onClick={() => handleRemoveBullet(expIdx, bulletIdx)}
                    title="Remove bullet"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Section 5: Education */}
      <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-surface-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.85rem' }}>
          <GraduationCap size={16} color="var(--primary)" />
          <span>Education</span>
        </div>

        {(cv.education || []).map((edu, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label className="form-label">Degree</label>
              <input 
                className="form-input" 
                value={edu.degree || ''} 
                onChange={(e) => {
                  const updated = [...cv.education];
                  updated[idx].degree = e.target.value;
                  setCv(prev => ({ ...prev, education: updated }));
                }}
              />
            </div>
            <div>
              <label className="form-label">University / Institution</label>
              <input 
                className="form-input" 
                value={edu.institution || ''} 
                onChange={(e) => {
                  const updated = [...cv.education];
                  updated[idx].institution = e.target.value;
                  setCv(prev => ({ ...prev, education: updated }));
                }}
              />
            </div>
            <div>
              <label className="form-label">Year / Dates</label>
              <input 
                className="form-input" 
                value={edu.graduationYear || ''} 
                onChange={(e) => {
                  const updated = [...cv.education];
                  updated[idx].graduationYear = e.target.value;
                  setCv(prev => ({ ...prev, education: updated }));
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
