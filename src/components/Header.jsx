import React from 'react';
import { 
  FileCheck2, 
  Sparkles, 
  FileText, 
  Sliders, 
  Download, 
  Key, 
  Sun, 
  Moon, 
  RotateCcw,
  Bot
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onLoadSample, 
  onOpenApiKeyModal, 
  theme, 
  toggleTheme,
  hasApiKey,
  onReset
}) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <FileCheck2 size={22} />
          </div>
          <div>
            <div className="brand-title">
              CV Tailor <span className="brand-badge">ATS 99+</span>
            </div>
          </div>
        </div>

        {/* Workflow Navigation */}
        <nav className="workflow-nav" aria-label="Workflow Steps">
          <button 
            className={`nav-tab-btn ${activeTab === 'input' ? 'active' : ''}`}
            onClick={() => setActiveTab('input')}
            title="Upload CV and Job Description"
          >
            <FileText size={16} />
            <span>1. Ingest</span>
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'tailor' ? 'active' : ''}`}
            onClick={() => setActiveTab('tailor')}
            title="View ATS Score and AI Tailored Improvements"
          >
            <Sparkles size={16} />
            <span>2. ATS & AI Tailor</span>
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
            title="Edit CV content directly"
          >
            <Sliders size={16} />
            <span>3. Edit & Refine</span>
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
            title="Preview and Export ATS Compliant PDF"
          >
            <Download size={16} />
            <span>4. PDF Export</span>
          </button>
        </nav>

        {/* Top Actions */}
        <div className="header-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onLoadSample}
            title="Load realistic sample CV & Job Description"
          >
            <Sparkles size={15} />
            <span>Load Demo</span>
          </button>

          <button 
            className={`btn-icon ${hasApiKey ? 'has-key' : ''}`} 
            onClick={onOpenApiKeyModal}
            title={hasApiKey ? "Gemini API Key configured" : "Configure Gemini API Key (Optional)"}
          >
            <Key size={17} color={hasApiKey ? "#10b981" : undefined} />
          </button>

          <button 
            className="btn-icon" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button 
            className="btn-icon" 
            onClick={onReset}
            title="Reset to blank inputs"
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
