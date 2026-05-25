import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { analyseResume } from '../api/resumeApi';
import { Upload, Loader2 } from 'lucide-react';

export default function UploadSection({ setResult, setPosition, loading, setLoading }) {
  const [file, setFile] = useState(null);
  const [pos, setPos] = useState('');
  const fileRef = useRef();

  const handleSubmit = async () => {
    if (!file) return toast.error('Please upload a resume');
    if (!pos.trim()) return toast.error('Please enter the job position');

    setLoading(true);
    try {
      const data = await analyseResume(file, pos);
      setResult(data);
      setPosition(pos);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-6">
      <h2 className="text-2xl font-semibold">Analyse Your Resume</h2>

      <div
        onClick={() => fileRef.current.click()}
        className="border-2 border-dashed border-gray-700 rounded-xl p-10 text-center cursor-pointer
                   hover:border-blue-500 hover:bg-blue-950/20 transition-all"
      >
        <Upload className="mx-auto mb-3 text-gray-400" size={36} />
        {file
          ? <p className="text-blue-400 font-medium">{file.name}</p>
          : <p className="text-gray-400">Click or drag your resume here <br/><span className="text-sm">PDF or DOCX, max 5MB</span></p>
        }
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={e => setFile(e.target.files[0])}
        />
      </div>

      <input
        type="text"
        placeholder="Job Position (e.g. Full Stack Developer)"
        value={pos}
        onChange={e => setPos(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3
                   text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                   rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition"
      >
        {loading ? <><Loader2 className="animate-spin" size={20}/> Analysing...</> : '🔍 Analyse Resume'}
      </button>
    </div>
  );
}