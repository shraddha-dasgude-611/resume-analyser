import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LogOut, History, User } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import HistoryPage from './pages/HistoryPage';
import UploadSection from './components/UploadSection';
import ResultSection from './components/ResultSection';
import JobSection from './components/JobSection';
import InterviewSection from './components/InterviewSection';

function HomePage() {
  const [result, setResult] = useState(null);
  const [position, setPosition] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <UploadSection
        setResult={setResult}
        setPosition={setPosition}
        setResumeText={setResumeText}
        loading={loading}
        setLoading={setLoading}
      />
      {result && <ResultSection result={result} resumeText={resumeText} />}
      {result && position && <InterviewSection position={position} resumeText={resumeText} />}
      {result && position && <JobSection position={position} />}
    </main>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
      <span className="text-2xl">🎯</span>
      <Link to="/" className="text-xl font-bold tracking-tight hover:text-blue-400 transition">
        ResumeAI Analyser
      </Link>

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <User size={16} />
          <span>{user?.name}</span>
        </div>

        <Link
          to="/history"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white
                     bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition"
        >
          <History size={16} /> History
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400
                     bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Toaster position="top-right" />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/login" element={<AuthPage />} />
      </Routes>
    </div>
  );
}