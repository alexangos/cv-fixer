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

export default function Home() {
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'suggestions' | 'optimized'>('suggestions');

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
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#111118]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">CV Fixer</h1>
              <p className="text-xs text-gray-400">AI Resume Optimizer</p>
            </div>
          </div>
          {results && (
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export PDF
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Upload Section */}
          <div className="bg-[#1a1a24] rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Upload Resume
            </h2>

            <label className={`
              block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
              ${resumeText
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'}
            `}>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              {resumeText ? (
                <div className="text-green-400">
                  <svg style={{ width: '48px', height: '48px', margin: '0 auto 8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium">{resumeFileName}</p>
                  <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>Click to replace</p>
                </div>
              ) : (
                <div className="text-gray-400">
                  <svg style={{ width: '48px', height: '48px', margin: '0 auto 8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="font-medium">Drop your PDF resume</p>
                  <p style={{ fontSize: '14px', marginTop: '4px' }}>or click to browse</p>
                </div>
              )}
            </label>
          </div>

          {/* Job Description Section */}
          <div className="bg-[#1a1a24] rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Job Description
            </h2>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-48 bg-[#111118] border border-gray-700 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-blue-500 transition"
            />

            <button
              onClick={analyzeResume}
              disabled={loading || !resumeText || !jobDescription}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                         disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed
                         py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analyze & Optimize
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          <div className="bg-[#1a1a24] rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Results
            </h2>

            {results ? (
              <div className="fade-in">
                {/* Score */}
                <div className="text-center mb-6">
                  <div
                    className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-2"
                    style={{
                      background: `conic-gradient(${getScoreColor(results.matchScore)} ${results.matchScore}%, #1f2937 0)`,
                      padding: '6px'
                    }}
                  >
                    <div className="w-full h-full bg-[#1a1a24] rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold">{results.matchScore}%</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {results.matchScore >= 80 ? 'Excellent Match!' :
                      results.matchScore >= 60 ? 'Good Match' : 'Needs Improvement'}
                  </p>
                </div>

                {/* Keywords */}
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Keywords Found</p>
                  <div className="flex flex-wrap gap-1">
                    {results.keywordsFound.slice(0, 5).map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        {kw}
                      </span>
                    ))}
                    {results.keywordsFound.length > 5 && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
                        +{results.keywordsFound.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Missing Keywords</p>
                  <div className="flex flex-wrap gap-1">
                    {results.keywordsMissing.slice(0, 5).map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggestions count */}
                <div className="text-center pt-4 border-t border-gray-700">
                  <p className="text-2xl font-bold text-blue-400">{results.suggestions.length}</p>
                  <p className="text-sm text-gray-400">Improvement Suggestions</p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}>
                <svg style={{ width: '64px', height: '64px', margin: '0 auto 12px', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>Upload resume & paste job description</p>
                <p style={{ fontSize: '14px', marginTop: '4px' }}>to see your match score</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Detailed Results */}
        {results && (
          <div className="mt-6 bg-[#1a1a24] rounded-2xl border border-gray-800 overflow-hidden fade-in">
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`flex-1 py-4 text-sm font-medium transition ${activeTab === 'suggestions'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
                  }`}
              >
                Suggestions ({results.suggestions.length})
              </button>
              <button
                onClick={() => setActiveTab('optimized')}
                className={`flex-1 py-4 text-sm font-medium transition ${activeTab === 'optimized'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
                  }`}
              >
                Optimized Resume
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[500px] overflow-y-auto">
              {activeTab === 'suggestions' ? (
                <div className="space-y-4">
                  {results.suggestions.map((sug, i) => (
                    <div key={i} className="bg-[#111118] rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          {sug.section}
                        </span>
                        <span className="text-gray-500 text-sm">{sug.reason}</span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">ORIGINAL</p>
                          <p className="text-gray-400 bg-[#1a1a24] p-3 rounded-lg">{sug.original}</p>
                        </div>
                        <div>
                          <p className="text-green-500 text-xs mb-1">IMPROVED</p>
                          <p className="text-white bg-green-500/10 p-3 rounded-lg border border-green-500/30">{sug.improved}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6 text-sm">
                  {results.optimizedSections.summary && (
                    <div>
                      <h3 className="text-blue-400 font-medium mb-2">Professional Summary</h3>
                      <p className="text-gray-300 bg-[#111118] p-4 rounded-lg">{results.optimizedSections.summary}</p>
                    </div>
                  )}

                  {results.optimizedSections.experience.length > 0 && (
                    <div>
                      <h3 className="text-blue-400 font-medium mb-2">Experience</h3>
                      <ul className="space-y-2">
                        {results.optimizedSections.experience.map((exp, i) => (
                          <li key={i} className="text-gray-300 bg-[#111118] p-4 rounded-lg">{exp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.optimizedSections.skills.length > 0 && (
                    <div>
                      <h3 className="text-blue-400 font-medium mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {results.optimizedSections.skills.map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-[#111118] rounded-full text-gray-300">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Warnings */}
            {results.warnings.length > 0 && (
              <div className="border-t border-gray-800 p-4 bg-yellow-500/5">
                <p className="text-yellow-400 text-sm font-medium mb-2">⚠️ Recommendations</p>
                <ul className="text-sm text-gray-400 space-y-1">
                  {results.warnings.map((warn, i) => (
                    <li key={i}>• {warn}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
