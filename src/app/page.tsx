'use client';

import { useState } from 'react';

interface OptimizationResult {
  matchScore: number;
  keywordsFound: string[];
  keywordsMissing: string[];
  suggestions: {
    section: string;
    original: string;
    improved: string;
    reason: string;
  }[];
  optimizedSections: {
    summary: string;
    experience: string[];
    skills: string[];
    education: string[];
  };
  warnings: string[];
  learningRecommendations: string[];
}

// Inline styles for reliable rendering
const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0f',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    borderBottom: '1px solid #1f2937',
    backgroundColor: '#111118',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: '#3b82f6',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  card: {
    backgroundColor: '#1a1a24',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #1f2937',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dropzone: {
    border: '2px dashed #374151',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  dropzoneActive: {
    border: '2px dashed #22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  textarea: {
    width: '100%',
    height: '192px',
    backgroundColor: '#111118',
    border: '1px solid #374151',
    borderRadius: '12px',
    padding: '16px',
    fontSize: '14px',
    color: '#f8fafc',
    resize: 'none' as const,
    outline: 'none',
  },
  button: {
    width: '100%',
    marginTop: '16px',
    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  buttonDisabled: {
    background: '#374151',
    cursor: 'not-allowed',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 0',
    color: '#6b7280',
  },
  scoreCircle: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    margin: '0 auto 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
  },
  scoreInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a24',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 700,
  },
  pill: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    marginRight: '4px',
    marginBottom: '4px',
  },
  pillGreen: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e',
  },
  pillRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
  },
  error: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: 'rgba(127, 29, 29, 0.3)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    borderRadius: '12px',
    color: '#f87171',
  },
};

export default function Home() {
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setResumeFileName(file.name);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setResumeText(data.text);
      setError('');
    } catch {
      setError('Failed to parse PDF');
    }
  };

  const analyzeResume = async () => {
    if (!resumeText || !jobDescription) {
      setError('Please upload a resume and paste a job description');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setResults(data);
    } catch {
      setError('Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>CV Fixer</h1>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>AI Resume Optimizer</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.grid}>
          {/* Upload Section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span style={{ color: '#60a5fa' }}>📄</span>
              Upload Resume
            </h2>

            <label style={{
              ...styles.dropzone,
              ...(resumeText ? styles.dropzoneActive : {}),
              display: 'block',
            }}>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              {resumeText ? (
                <div style={{ color: '#22c55e' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                  <p style={{ fontWeight: 500 }}>{resumeFileName}</p>
                  <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>Click to replace</p>
                </div>
              ) : (
                <div style={{ color: '#9ca3af' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📤</div>
                  <p style={{ fontWeight: 500 }}>Drop your PDF resume</p>
                  <p style={{ fontSize: '14px', marginTop: '4px' }}>or click to browse</p>
                </div>
              )}
            </label>
          </div>

          {/* Job Description Section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span style={{ color: '#a78bfa' }}>💼</span>
              Job Description
            </h2>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              style={styles.textarea}
            />

            <button
              onClick={analyzeResume}
              disabled={loading || !resumeText || !jobDescription}
              style={{
                ...styles.button,
                ...(loading || !resumeText || !jobDescription ? styles.buttonDisabled : {}),
              }}
            >
              {loading ? '⏳ Analyzing...' : '✨ Analyze & Optimize'}
            </button>
          </div>

          {/* Results Section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span style={{ color: '#34d399' }}>📊</span>
              Results
            </h2>

            {results ? (
              <div>
                {/* Score */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    ...styles.scoreCircle,
                    background: `conic-gradient(${getScoreColor(results.matchScore)} ${results.matchScore}%, #1f2937 0)`,
                  }}>
                    <div style={styles.scoreInner}>
                      {results.matchScore}%
                    </div>
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                    {results.matchScore >= 80 ? 'Excellent Match!' :
                      results.matchScore >= 60 ? 'Good Match' : 'Needs Improvement'}
                  </p>
                </div>

                {/* Keywords Found */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>Keywords Found</p>
                  <div>
                    {results.keywordsFound.slice(0, 5).map((kw, i) => (
                      <span key={i} style={{ ...styles.pill, ...styles.pillGreen }}>{kw}</span>
                    ))}
                  </div>
                </div>

                {/* Keywords Missing */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>Missing Keywords</p>
                  <div>
                    {results.keywordsMissing.slice(0, 5).map((kw, i) => (
                      <span key={i} style={{ ...styles.pill, ...styles.pillRed }}>{kw}</span>
                    ))}
                  </div>
                </div>

                {/* Suggestions count */}
                <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #374151' }}>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#60a5fa' }}>{results.suggestions.length}</p>
                  <p style={{ fontSize: '14px', color: '#9ca3af' }}>Improvement Suggestions</p>
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>📋</div>
                <p>Upload resume & paste job description</p>
                <p style={{ fontSize: '14px', marginTop: '4px' }}>to see your match score</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {/* Detailed Suggestions */}
        {results && results.suggestions.length > 0 && (
          <div style={{ ...styles.card, marginTop: '24px' }}>
            <h2 style={styles.cardTitle}>💡 Suggestions</h2>
            {results.suggestions.map((sug, i) => (
              <div key={i} style={{
                backgroundColor: '#111118',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                border: '1px solid #1f2937'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    marginRight: '8px'
                  }}>
                    {sug.section}
                  </span>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>{sug.reason}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>ORIGINAL</p>
                    <p style={{ fontSize: '14px', color: '#9ca3af', backgroundColor: '#1a1a24', padding: '12px', borderRadius: '8px' }}>{sug.original}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#22c55e', marginBottom: '4px' }}>IMPROVED</p>
                    <p style={{ fontSize: '14px', color: '#f8fafc', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>{sug.improved}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
