import { useState } from 'react';
import { Wand2, Download, RotateCcw, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

async function callBuildResume(payload) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/resume/build', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to build resume');
  return res.json();
}

function ResumePreview({ resume }) {
  return (
    <div className="bg-white text-gray-900 rounded-xl p-8 space-y-5 text-sm leading-relaxed shadow-lg">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">{resume.name || 'Your Name'}</h1>
        <p className="text-gray-500 mt-1 text-xs">
          {[resume.email, resume.phone, resume.linkedin].filter(Boolean).join(' • ')}
        </p>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1 mb-2">
            Summary
          </h2>
          <p className="text-gray-700">{resume.summary}</p>
        </div>
      )}

      {/* Skills */}
      {resume.skills?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1 mb-2">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((s, i) => (
              <span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {resume.experience?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1 mb-2">
            Experience
          </h2>
          <div className="space-y-4">
            {resume.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{exp.role}</p>
                    <p className="text-gray-400 italic text-xs">{exp.company}</p>
                  </div>
                  <p className="text-gray-400 text-xs shrink-0">{exp.duration}</p>
                </div>
                <ul className="mt-2 space-y-1 text-gray-700">
                  {exp.bullets?.map((b, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="text-gray-400 shrink-0 mt-0.5">▸</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {resume.projects?.filter(p => p.name).length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1 mb-2">
            Projects
          </h2>
          <div className="space-y-2">
            {resume.projects.filter(p => p.name).map((p, i) => (
              <div key={i}>
                <p className="font-semibold text-gray-900">{p.name}</p>
                <p className="text-gray-600 text-xs mt-0.5">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-1">
            {resume.education.map((edu, i) => (
              <div key={i} className="flex justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{edu.degree}</p>
                  <p className="text-gray-400 text-xs">{edu.institution}</p>
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

// Step 1 — Question form
function QuestionForm({ position, onSubmit }) {
  const [form, setForm] = useState({
    relevantSkills: '',
    projects: '',
    courses: '',
    whyThisRole: '',
    experienceOverlap: '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = `w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 
    text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 
    focus:ring-1 focus:ring-blue-500 transition resize-none`;

  return (
    <div className="space-y-5">
      <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
        <p className="text-blue-300 text-sm">
          💡 Answer what you can — skip anything that doesn't apply. 
          The AI will only use what's true about you.
        </p>
      </div>

      {/* Q1 */}
      <div className="space-y-2">
        <label className="text-gray-300 text-sm font-medium">
          1. Do you have any skills relevant to <span className="text-blue-400">{position}</span>?
          <span className="text-gray-500 font-normal ml-1">(even self-taught, basic, or in-progress)</span>
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Basic HTML/CSS, did a React tutorial, know some JavaScript..."
          className={inputClass}
          value={form.relevantSkills}
          onChange={e => handleChange('relevantSkills', e.target.value)}
        />
      </div>

      {/* Q2 */}
      <div className="space-y-2">
        <label className="text-gray-300 text-sm font-medium">
          2. Any personal, freelance, or side projects related to this role?
          <span className="text-gray-500 font-normal ml-1">(describe briefly)</span>
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Built a personal portfolio site, made a to-do app with React..."
          className={inputClass}
          value={form.projects}
          onChange={e => handleChange('projects', e.target.value)}
        />
      </div>

      {/* Q3 */}
      <div className="space-y-2">
        <label className="text-gray-300 text-sm font-medium">
          3. Any courses, certifications, or bootcamps related to this role?
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Udemy React course (in progress), freeCodeCamp HTML/CSS certificate..."
          className={inputClass}
          value={form.courses}
          onChange={e => handleChange('courses', e.target.value)}
        />
      </div>

      {/* Q4 */}
      <div className="space-y-2">
        <label className="text-gray-300 text-sm font-medium">
          4. Does any part of your current/past work overlap with this role?
        </label>
        <textarea
          rows={2}
          placeholder="e.g. I built internal dashboards, worked with frontend teams, created data visualizations..."
          className={inputClass}
          value={form.experienceOverlap}
          onChange={e => handleChange('experienceOverlap', e.target.value)}
        />
      </div>

      {/* Q5 */}
      <div className="space-y-2">
        <label className="text-gray-300 text-sm font-medium">
          5. Why are you transitioning to / applying for this role?
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Passionate about building user interfaces, want to move from data to product..."
          className={inputClass}
          value={form.whyThisRole}
          onChange={e => handleChange('whyThisRole', e.target.value)}
        />
      </div>

      <button
        onClick={() => onSubmit(form)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold 
                   py-3 rounded-xl transition flex items-center justify-center gap-2"
      >
        Build My Resume <ArrowRight size={16} />
      </button>
    </div>
  );
}

export default function ResumeBuilder({ result, resumeText }) {
  // steps: 'cta' | 'form' | 'loading' | 'done'
  const [step, setStep] = useState('cta');
  const [builtResume, setBuiltResume] = useState(null);
  const [improvements, setImprovements] = useState([]);
  const [error, setError] = useState(null);
  const [showImprovements, setShowImprovements] = useState(true);

  const {
    score: matchPercentage = 0,
    missingKeywords = [],
    position = '',
  } = result;

  if (matchPercentage >= 70) return null;

  const handleFormSubmit = async (formAnswers) => {
    setStep('loading');
    setError(null);
    try {
      const data = await callBuildResume({
        resumeText,
        position,
        missingKeywords,
        score: matchPercentage,
        userAnswers: formAnswers,   // ← send form answers to server
      });
      setBuiltResume(data.builtResume);
      setImprovements(data.builtResume.improvements || []);
      setStep('done');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setStep('form');
    }
  };

  const handleDownload = () => {
    if (!builtResume) return;
    const r = builtResume;
    const lines = [
      r.name || '',
      [r.email, r.phone, r.linkedin].filter(Boolean).join(' | '),
      '',
      'SUMMARY',
      r.summary || '',
      '',
      'SKILLS',
      (r.skills || []).join(', '),
      '',
      'EXPERIENCE',
      ...(r.experience || []).flatMap(e => [
        `${e.role} | ${e.company} | ${e.duration}`,
        ...(e.bullets || []).map(b => `  • ${b}`),
        '',
      ]),
      'PROJECTS',
      ...(r.projects || []).filter(p => p.name).map(p => `${p.name}: ${p.description}`),
      '',
      'EDUCATION',
      ...(r.education || []).map(e => `${e.degree} — ${e.institution} (${e.year})`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rebuilt_resume.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLow = matchPercentage < 40;
  const borderColor = isLow ? 'border-red-500/50' : 'border-yellow-500/50';
  const accentColor = isLow ? 'text-red-400' : 'text-yellow-400';
  const bgAccent = isLow ? 'bg-red-900/20' : 'bg-yellow-900/20';

  return (
    <div className={`bg-gray-900 rounded-2xl p-8 border ${borderColor} space-y-6`}>

      {/* Header — always visible */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Wand2 size={22} /> AI Resume Builder
          </h2>
          <p className={`mt-1 text-sm ${accentColor}`}>
            {isLow
              ? `Score of ${matchPercentage}% is low — let AI rebuild your resume for this role`
              : `Score of ${matchPercentage}% can be improved — AI will optimize your resume`}
          </p>
        </div>
        <span className={`text-3xl px-3 py-1 rounded-lg ${bgAccent}`}>
          {isLow ? '🔴' : '🟡'}
        </span>
      </div>

      {/* STEP: CTA */}
      {step === 'cta' && (
        <div className={`${bgAccent} rounded-xl p-6 text-center space-y-4`}>
          <p className="text-gray-300 text-sm max-w-lg mx-auto">
            We'll ask you a few quick questions about your actual skills and experience,
            then rebuild your resume to match <span className="text-white font-medium">{position}</span> — honestly and accurately.
          </p>
          <button
            onClick={() => setStep('form')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold 
                       px-8 py-3 rounded-xl transition flex items-center gap-2 mx-auto"
          >
            <Wand2 size={16} /> Build Better Resume
          </button>
        </div>
      )}

      {/* STEP: Form */}
      {step === 'form' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <p className="text-gray-400 text-sm">
              Tell us about yourself so we can rebuild accurately
            </p>
          </div>
          <QuestionForm position={position} onSubmit={handleFormSubmit} />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>
      )}

      {/* STEP: Loading */}
      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <svg className="animate-spin h-10 w-10 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-gray-400 text-sm">Rebuilding your resume with AI...</p>
          <p className="text-gray-600 text-xs">This takes about 10–15 seconds</p>
        </div>
      )}

      {/* STEP: Done */}
      {step === 'done' && builtResume && (
        <div className="space-y-5">

          {/* Improvements */}
          {improvements.length > 0 && (
            <div className="bg-green-900/30 border border-green-700/50 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowImprovements(p => !p)}
                className="w-full flex items-center justify-between px-5 py-3 text-green-400 font-semibold text-sm"
              >
                <span>✅ What we improved ({improvements.length} changes)</span>
                {showImprovements ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showImprovements && (
                <ul className="px-5 pb-4 space-y-1">
                  {improvements.map((imp, i) => (
                    <li key={i} className="text-gray-300 text-sm flex gap-2">
                      <span className="text-green-400 shrink-0">→</span> {imp}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">📄 Your Rebuilt Resume</h3>
            <div className="flex gap-3">
              <button
                onClick={() => { setStep('form'); setBuiltResume(null); }}
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