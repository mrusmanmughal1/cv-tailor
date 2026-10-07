import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import AtsScoreCard from './components/AtsScoreCard';
import DiffViewer from './components/DiffViewer';
import CvEditor from './components/CvEditor';
import CvPreview from './components/CvPreview';
import ApiKeyModal from './components/ApiKeyModal';

import { sampleCV, sampleJobDescription } from './data/sampleData';
import { analyzeAtsScore } from './services/atsAnalyzer';
import { tailorCvWithGemini, getStoredApiKey } from './services/geminiService';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('input');
  
  // CV & JD state (pre-initialized with sample data for immediate wow factor)
  const [cv, setCv] = useState(sampleCV);
  const [originalCv, setOriginalCv] = useState(sampleCV);
  const [jobDescription, setJobDescription] = useState(sampleJobDescription);
  
  // Analysis & Tailoring state
  const [analysis, setAnalysis] = useState(null);
  const [diffs, setDiffs] = useState([]);
  const [tailorEngine, setTailorEngine] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  
  // Template & Settings
  const [template, setTemplate] = useState('classic');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(Boolean(getStoredApiKey()));

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Run initial analysis on load
  useEffect(() => {
    if (cv && jobDescription) {
      const initialReport = analyzeAtsScore(cv, jobDescription);
      setAnalysis(initialReport);
    }
  }, []);

  // When CV changes, recompute analysis if JD is present
  useEffect(() => {
    if (cv && jobDescription) {
      const updatedReport = analyzeAtsScore(cv, jobDescription);
      setAnalysis(updatedReport);
    }
  }, [cv]);

  const handleLoadSample = () => {
    setCv(sampleCV);
    setOriginalCv(sampleCV);
    setJobDescription(sampleJobDescription);
    const report = analyzeAtsScore(sampleCV, sampleJobDescription);
    setAnalysis(report);
    setDiffs([]);
    setActiveTab('input');
  };

  const handleReset = () => {
    const emptyCv = {
      personalInfo: {
        fullName: '',
        jobTitle: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: ''
      },
      summary: '',
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      projects: []
    };
    setCv(emptyCv);
    setOriginalCv(emptyCv);
    setJobDescription('');
    setAnalysis(null);
    setDiffs([]);
    setActiveTab('input');
  };

  const handleAnalyze = () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const report = analyzeAtsScore(cv, jobDescription);
      setAnalysis(report);
      setIsAnalyzing(false);
      setActiveTab('tailor');
    }, 300);
  };

  const handleTailor = async () => {
    if (!jobDescription.trim()) return;
    setIsTailoring(true);
    try {
      const result = await tailorCvWithGemini(cv, jobDescription);
      setCv(result.tailoredCv);
      setDiffs(result.diffs || []);
      setTailorEngine(result.engine);
      
      // Update ATS score immediately
      const newAnalysis = analyzeAtsScore(result.tailoredCv, jobDescription);
      setAnalysis(newAnalysis);
      setActiveTab('tailor');
    } catch (err) {
      console.error('Tailor error:', err);
    } finally {
      setIsTailoring(false);
    }
  };

  const handleAddMissingSkill = (skill) => {
    const formatted = skill.charAt(0).toUpperCase() + skill.slice(1);
    setCv(prev => ({
      ...prev,
      skills: Array.from(new Set([formatted, ...(prev.skills || [])]))
    }));
  };

  return (
    <div className="app-container">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLoadSample={handleLoadSample}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        hasApiKey={hasApiKey}
        onReset={handleReset}
      />

      <main className="main-wrapper">
        {/* TAB 1: Ingest (CV Upload & Job Description) */}
        {activeTab === 'input' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                Tailor Your CV to Beat Applicant Tracking Systems
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Upload your existing CV or paste the text, provide the target job description, and let our ATS optimizer enrich your qualifications.
              </p>
            </div>

            <InputSection 
              cv={cv}
              setCv={(newCv) => {
                setCv(newCv);
                setOriginalCv(newCv);
              }}
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              onAnalyze={handleAnalyze}
              onTailor={handleTailor}
              isAnalyzing={isAnalyzing}
              isTailoring={isTailoring}
            />

            {/* Quick preview card below ingestion */}
            {analysis && (
              <div style={{ marginTop: '1.5rem' }}>
                <AtsScoreCard 
                  analysis={analysis} 
                  onAddMissingSkill={handleAddMissingSkill}
                  onTriggerTailor={handleTailor}
                  isTailoring={isTailoring}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ATS & AI Tailor */}
        {activeTab === 'tailor' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  ATS Match Score & AI Optimizations
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Detailed breakdown of keyword density, quantifiable impact metrics, and tailored bullet point rewrites.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('editor')}
                >
                  Edit Resume Content
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('preview')}
                >
                  View & Download PDF
                </button>
              </div>
            </div>

            <AtsScoreCard 
              analysis={analysis} 
              onAddMissingSkill={handleAddMissingSkill}
              onTriggerTailor={handleTailor}
              isTailoring={isTailoring}
            />

            <DiffViewer 
              diffs={diffs} 
              engine={tailorEngine} 
            />
          </div>
        )}

        {/* TAB 3: Edit & Refine */}
        {activeTab === 'editor' && (
          <div className="split-grid">
            <div>
              <CvEditor 
                cv={cv} 
                setCv={setCv} 
              />
            </div>
            <div>
              {/* Sticky live preview while editing */}
              <div style={{ position: 'sticky', top: '75px' }}>
                <CvPreview 
                  cv={cv} 
                  template={template} 
                  setTemplate={setTemplate} 
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Preview & PDF Export */}
        {activeTab === 'preview' && (
          <div>
            <CvPreview 
              cv={cv} 
              template={template} 
              setTemplate={setTemplate} 
            />
          </div>
        )}
      </main>

      {/* API Key Configuration Modal */}
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={(k) => setHasApiKey(Boolean(k))}
      />
    </div>
  );
}
