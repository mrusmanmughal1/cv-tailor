import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Eye
} from 'lucide-react';
import { extractTextFromPDF, parseRawCvText } from '../services/pdfParser';

export default function InputSection({ 
  cv, 
  setCv, 
  jobDescription, 
  setJobDescription, 
  onAnalyze, 
  onTailor, 
  isAnalyzing, 
  isTailoring 
}) {
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'text'
  const [rawText, setRawText] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setUploadStatus('error');
      setErrorMessage('Please upload a valid .pdf file');
      return;
    }

    try {
      setUploadStatus('loading');
      setErrorMessage('');
      const extractedText = await extractTextFromPDF(file);
      
      if (!extractedText || extractedText.length < 50) {
        throw new Error('Extracted text was too short. The PDF may be scanned as an image.');
      }

      const parsedCv = parseRawCvText(extractedText);
      setCv(parsedCv);
      setRawText(extractedText);
      setUploadStatus('success');
    } catch (err) {
      console.error(err);
      setUploadStatus('error');
      setErrorMessage(err.message || 'Failed to extract text from PDF');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRawTextSubmit = () => {
    if (!rawText.trim()) return;
    const parsedCv = parseRawCvText(rawText);
    setCv(parsedCv);
    setUploadStatus('success');
  };

  return (
    <div className="split-grid">
      {/* Left Column: CV Ingestion */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <FileText size={20} color="var(--primary)" />
            <span>1. Your Current CV / Resume</span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button 
              className={`btn btn-secondary ${inputMode === 'upload' ? 'btn-primary' : ''}`}
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
              onClick={() => setInputMode('upload')}
            >
              Upload PDF
            </button>
            <button 
              className={`btn btn-secondary ${inputMode === 'text' ? 'btn-primary' : ''}`}
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
              onClick={() => setInputMode('text')}
            >
              Paste Text
            </button>
          </div>
        </div>

        {inputMode === 'upload' ? (
          <div>
            <div 
              className="dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".pdf" 
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
              />
              <UploadCloud className="dropzone-icon" />
              <div className="dropzone-text">Click to upload or drag & drop your CV</div>
              <div className="dropzone-subtext">Supports ATS-readable PDF files</div>
            </div>

            {uploadStatus === 'loading' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <RefreshCw size={16} className="spin" />
                <span>Extracting text and structure from PDF...</span>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">
              <span>Paste CV plain text</span>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                onClick={handleRawTextSubmit}
              >
                Parse Structure
              </button>
            </label>
            <textarea 
              className="form-textarea" 
              placeholder="Paste full text of your CV here..."
              rows={9}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
          </div>
        )}

        {/* Current Parsed Summary Badge */}
        {cv && cv.personalInfo && (
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>CURRENT LOADED CV</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}>
                <CheckCircle2 size={14} /> Ready
              </span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              {cv.personalInfo.fullName || 'Candidate Name'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>
              {cv.personalInfo.jobTitle || 'Job Title'}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <span>💼 {cv.experience?.length || 0} Experience roles</span>
              <span>⚡ {cv.skills?.length || 0} Skills</span>
              <span>🎓 {cv.education?.length || 0} Degrees</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Job Description Ingestion */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <Briefcase size={20} color="#8b5cf6" />
            <span>2. Target Job Description (JD)</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {jobDescription ? `${jobDescription.split(/\s+/).filter(Boolean).length} words` : 'Paste job post'}
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Paste the full job requirements, responsibilities & tech stack</span>
          </label>
          <textarea 
            className="form-textarea" 
            placeholder="e.g. Senior Full Stack Engineer at TechCorp. Requirements: 5+ years React, TypeScript, Node.js, AWS, Kubernetes..."
            rows={11}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        {/* Action Trigger Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            style={{ flex: 1 }}
            onClick={onAnalyze}
            disabled={!jobDescription.trim() || isAnalyzing}
          >
            <Eye size={16} />
            <span>Analyze ATS Match</span>
          </button>

          <button 
            className="btn btn-primary" 
            style={{ flex: 1.2 }}
            onClick={onTailor}
            disabled={!jobDescription.trim() || isTailoring}
          >
            <Sparkles size={16} />
            <span>{isTailoring ? 'Tailoring CV...' : 'Tailor CV with AI'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
