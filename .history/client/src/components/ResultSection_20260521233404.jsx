import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

export default function ResultSection({ result }) {

  if (!result) {
    return <div className="text-white">Loading...</div>;
  }

  const {
    matchPercentage = 0,
    matchedKeywords = [],
    missingKeywords = [],
    suggestions = []
  } = result;

  const color =
    matchPercentage >= 70
      ? '#22c55e'
      : matchPercentage >= 40
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-8">

      <h2 className="text-2xl font-semibold">
        📊 Analysis Results
      </h2>

      {/* Score */}
      <div className="flex items-center gap-8">

        <div className="w-36 h-36 shrink-0">
          <CircularProgressbar
            value={matchPercentage}
            text={`${matchPercentage}%`}
            styles={buildStyles({
              pathColor: color,
              textColor: color,
              trailColor: '#1f2937',
              textSize: '20px'
            })}
          />
        </div>

        <div>
          <p className="text-3xl font-bold" style={{ color }}>
            {matchPercentage >= 70
              ? 'Strong Match! 🎉'
              : matchPercentage >= 40
              ? 'Moderate Match 🟡'
              : 'Needs Work 🔴'}
          </p>

          <p className="text-gray-400 mt-1">
            Your resume aligns {matchPercentage}% with this position
          </p>
        </div>

      </div>

      {/* Keywords Grid */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Matched */}
        <div className="bg-gray-800 rounded-xl p-5">

          <h3 className="flex items-center gap-2 font-semibold text-green-400 mb-3">
            <CheckCircle size={18}/>
            Matched Keywords
          </h3>

          <div className="flex flex-wrap gap-2">

            {matchedKeywords.map((kw, index) => (
              <span
                key={index}
                className="bg-green-900/40 text-green-300 border border-green-700 px-3 py-1 rounded-full text-sm"
              >
                {kw}
              </span>
            ))}

          </div>

        </div>

        {/* Missing */}
        <div className="bg-gray-800 rounded-xl p-5">

          <h3 className="flex items-center gap-2 font-semibold text-red-400 mb-3">
            <XCircle size={18}/>
            Missing Keywords
          </h3>

          <div className="flex flex-wrap gap-2">

            {missingKeywords.map((kw, index) => (
              <span
                key={index}
                className="bg-red-900/40 text-red-300 border border-red-700 px-3 py-1 rounded-full text-sm"
              >
                {kw}
              </span>
            ))}

          </div>

        </div>

      </div>

      {/* Suggestions */}
      <div className="bg-gray-800 rounded-xl p-5">

        <h3 className="flex items-center gap-2 font-semibold text-yellow-400 mb-4">
          <Lightbulb size={18}/>
          Suggestions
        </h3>

        <ul className="space-y-3">

          {suggestions.map((s, i) => (
            <li key={i} className="flex gap-3 text-gray-300">

              <span className="text-yellow-500 font-bold shrink-0">
                {i + 1}.
              </span>

              <span>{s}</span>

            </li>
          ))}

        </ul>

      </div>

    </div>
  );
}