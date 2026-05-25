import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import UploadSection from './components/UploadSection';
import ResultSection from './components/ResultSection';
import JobSection from './components/JobSection';

export default function App() {
  const [result, setResult] = useState(null);
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Toaster position="top-right" />

      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <h1 className="text-xl font-bold tracking-tight">ResumeAI Analyser</h1>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <UploadSection
          setResult={setResult}
          setPosition={setPosition}
          loading={loading}
          setLoading={setLoading}
        />

        {result && (
          <>
            <ResultSection result={result} />
            <JobSection position={position} />
          </>
        )}
      </main>
    </div>
  );
}