import { useState } from 'react';
import { Wand2, Download, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import jsPDF from 'jspdf';
async function callBuildResume({ resumeText, position, missingKeywords, score }) {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/resume/build', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ resumeText, position, missingKeywords, score }),
  });
  if (!res.ok) throw new Error('Failed to build resume');
  return res.json();
}

function ResumePreview({ resume }) {
  return (
    <div className="bg-white text-gray-900 rounded-xl p-8 space-y-5 text-sm leading-relaxed">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold">{resume.name || 'Your Name'}</h1>
        <p className="text-gray-500 mt-1 text-xs">
          {[resume.email, resume.phone, resume.linkedin].filter(Boolean).join(' • ')}
        </p>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-2">
            Summary
          </h2>
          <p className="text-gray-700">{resume.summary}</p>
        </div>
      )}

      {/* Skills */}
      {resume.skills?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-2">
            Skills
          </h2>
          <p className="text-gray-700">{resume.skills.join(' • ')}</p>
        </div>
      )}

      {/* Experience */}
      {resume.experience?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-2">
            Experience
          </h2>
          <div className="space-y-4">
            {resume.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{exp.role}</p>
                    <p className="text-gray-500 italic text-xs">{exp.company}</p>
                  </div>
                  <p className="text-gray-400 text-xs shrink-0">{exp.duration}</p>
                </div>
                <ul className="mt-1 space-y-1 list-disc list-inside text-gray-700">
                  {exp.bullets?.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {resume.projects?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-2">
            Projects
          </h2>
          <div className="space-y-2">
            {resume.projects.map((p, i) => (
              <div key={i}>
                <p className="font-semibold text-gray-900">{p.name}</p>
                <p className="text-gray-600 text-xs">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-1">
            {resume.education.map((edu, i) => (
              <div key={i} className="flex justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{edu.degree}</p>
                  <p className="text-gray-500 text-xs">{edu.institution}</p>
                </div>
                <p className="text-gray-400 text-xs">{edu.year}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumeBuilder({ result, resumeText }) {
  const [loading, setLoading] = useState(false);
  const [builtResume, setBuiltResume] = useState(null);
  const [error, setError] = useState(null);
  const [showImprovements, setShowImprovements] = useState(true);

  // Pull exact variable names from result (matching ResultSection.jsx)
  const {
    score: matchPercentage = 0,
    missingKeywords = [],
    position = '',
  } = result;

  // Only show for low or moderate scores
  if (matchPercentage >= 70) return null;

  const handleBuild = async () => {
    setLoading(true);
    setError(null);
    setBuiltResume(null);
    try {
      const data = await callBuildResume({
        resumeText,
        position,
        missingKeywords,
        score: matchPercentage,
      });
      setBuiltResume(data.builtResume);
      setShowImprovements(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!builtResume) return;
    const r = builtResume;
    const lines = [
      r.name || '',
      [r.email, r.phone, r.linkedin].filter(Boolean).join(' | '),
      '',
      '── SUMMARY ──',
      r.summary || '',
      '',
      '── SKILLS ──',
      (r.skills || []).join(', '),
      '',
      '── EXPERIENCE ──',
      ...(r.experience || []).flatMap(e => [
        `${e.role} | ${e.company} | ${e.duration}`,
        ...(e.bullets || []).map(b => `  • ${b}`),
        '',
      ]),
      '── PROJECTS ──',
      ...(r.projects || []).map(p => `${p.name}: ${p.description}`),
      '',
      '── EDUCATION ──',
      ...(r.education || []).map(e => `${e.degree} — ${e.institution} (${e.year})`),
    ];

    const doc = new jsPDF();

const text = lines.join('\n');

const splitText = doc.splitTextToSize(text, 180);

doc.setFont('helvetica', 'normal');
doc.setFontSize(11);

doc.text(splitText, 15, 20);

doc.save('rebuilt_resume.pdf');
  };

  const isLow = matchPercentage < 40;
  const borderColor = isLow ? 'border-red-500/50' : 'border-yellow-500/50';
  const accentColor = isLow ? 'text-red-400' : 'text-yellow-400';
  const bgAccent = isLow ? 'bg-red-900/20' : 'bg-yellow-900/20';

  return (
    <div className={`bg-gray-900 rounded-2xl p-8 border ${borderColor} space-y-6`}>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Wand2 size={22} />
            AI Resume Builder
          </h2>
          <p className={`mt-1 text-sm ${accentColor}`}>
            {isLow
              ? `Your score of ${matchPercentage}% is low — let AI rebuild your resume for this role`
              : `Your score of ${matchPercentage}% can be improved — AI will optimize your resume`}
          </p>
        </div>
        <span className={`text-3xl px-3 py-1 rounded-lg ${bgAccent}`}>
          {isLow ? '🔴' : '🟡'}
        </span>
      </div>

      {/* CTA — only show if not yet built */}
      {!builtResume && (
        <div className={`${bgAccent} rounded-xl p-6 text-center space-y-4`}>
          <p className="text-gray-300 text-sm max-w-lg mx-auto">
            We'll rewrite your resume to naturally include missing keywords, strengthen your bullet points,
            and improve ATS compatibility — without fabricating anything.
          </p>
          <button
            onClick={handleBuild}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed
                       text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200
                       flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Building your resume...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                Build Better Resume
              </>
            )}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      )}

      {/* Result */}
      {builtResume && (
        <div className="space-y-5">

          {/* Improvements toggle */}
          {builtResume.improvements?.length > 0 && (
            <div className="bg-green-900/30 border border-green-700/50 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowImprovements(p => !p)}
                className="w-full flex items-center justify-between px-5 py-3 text-green-400 font-semibold text-sm"
              >
                <span>✅ What we improved ({builtResume.improvements.length} changes)</span>
                {showImprovements ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showImprovements && (
                <ul className="px-5 pb-4 space-y-1">
                  {builtResume.improvements.map((imp, i) => (
                    <li key={i} className="text-gray-300 text-sm flex gap-2">
                      <span className="text-green-400 shrink-0">→</span>
                      {imp}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Preview header */}
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">📄 Your Rebuilt Resume</h3>
            <div className="flex gap-3">
              <button
                onClick={() => { setBuiltResume(null); setError(null); }}
                className="flex items-center gap-1 text-gray-400 hover:text-white text-sm
                           bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition"
              >
                <RotateCcw size={14} /> Rebuild
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700
                           text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                <Download size={14} /> Download
              </button>
            </div>
          </div>

          <ResumePreview resume={builtResume} />
        </div>
      )}

    </div>
  );
}