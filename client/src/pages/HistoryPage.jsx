import { useEffect, useState } from 'react';
import { fetchHistory } from '../api/resumeApi';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Loader2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scoreColor = (score) =>
    score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400';

  const scoreBg = (score) =>
    score >= 70 ? 'bg-green-900/30 border-green-700' : score >= 40 ? 'bg-yellow-900/30 border-yellow-700' : 'bg-red-900/30 border-red-700';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
          <ArrowLeft size={18} /> Back
        </Link>
        <span className="text-gray-600">|</span>
        <span className="text-2xl">📋</span>
        <h1 className="text-xl font-bold">Analysis History</h1>
        <span className="ml-auto text-sm text-gray-400">
          Welcome, {user?.name}
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-gray-400 mt-20">
            <Loader2 className="animate-spin" size={24} />
            <span>Loading history...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center mt-20 text-gray-500">
            <TrendingUp size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No analyses yet.</p>
            <Link to="/" className="text-blue-400 hover:underline mt-2 inline-block">
              Analyse your first resume →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-6">
              {history.length} analysis{history.length > 1 ? 'es' : ''} found
            </p>
            {history.map((item) => (
              <div
                key={item._id}
                className="bg-gray-900 rounded-2xl p-6 border border-gray-800 flex items-center gap-6"
              >
                {/* Score circle */}
                <div className={`w-20 h-20 shrink-0 rounded-full border-2 flex flex-col items-center justify-center ${scoreBg(item.score)}`}>
                  <span className={`text-2xl font-bold ${scoreColor(item.score)}`}>
                    {item.score}%
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg capitalize">{item.position}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.matchedKeywords?.slice(0, 5).map(kw => (
                      <span key={kw} className="text-xs bg-green-900/30 text-green-300 border border-green-800 px-2 py-0.5 rounded-full">
                        {kw}
                      </span>
                    ))}
                    {item.matchedKeywords?.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{item.matchedKeywords.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Score bar */}
                <div className="w-32 hidden md:block">
                  <div className="text-xs text-gray-500 mb-1 text-right">Match</div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.score >= 70 ? 'bg-green-500' :
                        item.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <div className={`text-right text-sm font-bold mt-1 ${scoreColor(item.score)}`}>
                    {item.score}%
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