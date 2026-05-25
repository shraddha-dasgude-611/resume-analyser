import { useEffect, useState } from 'react';
import { fetchJobs } from '../api/resumeApi';
import { ExternalLink, MapPin, Building2, Loader2, AlertCircle } from 'lucide-react';

export default function JobSection({ position }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!position) return;

        setLoading(true);
        setError('');
        setJobs([]);

        fetchJobs(position)
            .then(data => {
                if (!data || data.length === 0) {
                    setError('No jobs found for this position.');
                    setJobs([]);
                } else {
                    setJobs(Array.isArray(data) ? data : []);
                }
            })
            .catch(err => {
                const msg = err.response?.data?.error || err.message || 'Unknown error';
                setError(`Failed to load jobs: ${msg}`);
                console.error('Jobs error:', err.response?.data || err.message);
            })
            .finally(() => setLoading(false));
    }, [position]);

    return (
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-6">
                💼 Job Opportunities for "{position}"
            </h2>

            {loading && (
                <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="animate-spin" size={20} />
                    Loading jobs...
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-800 rounded-xl p-4">
                    <AlertCircle size={18} />
                    <p>{error}</p>
                </div>
            )}

            <div className="space-y-4 mt-4">
                {jobs?.map(job => (
                    <div
                        key={job.id || job.applyLink}
                        className="bg-gray-800 rounded-xl p-5 flex gap-4 hover:bg-gray-700 transition border border-gray-700"
                    >
                        {job.logo && (
                            <img
                                src={job.logo}
                                alt={job.company}
                                className="w-12 h-12 rounded-lg object-contain bg-white p-1 shrink-0"
                            />
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-white">
                                        {job.title}
                                    </h3>

                                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                        <Building2 size={14} /> {job.company}
                                        <span className="mx-1">·</span>
                                        <MapPin size={14} /> {job.location || 'Remote'}
                                    </p>
                                </div>

                                <a
                                    href={job.applyLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="shrink-0 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                                >
                                    Apply <ExternalLink size={14} />
                                </a>
                            </div>

                            <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                                {job.description}
                            </p>

                            <span className="mt-2 inline-block text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded-full">
                                via {job.platform}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}