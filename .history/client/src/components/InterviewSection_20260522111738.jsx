import { useState, useEffect, useRef } from 'react';
import { generateQuestions, evaluateAnswer } from '../api/resumeApi';
import { Loader2, Mic, MicOff, Volume2, ChevronRight, CheckCircle, Star, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
  technical: { label: 'Technical', color: 'text-blue-400 bg-blue-900/30 border-blue-700' },
  hr: { label: 'HR', color: 'text-purple-400 bg-purple-900/30 border-purple-700' },
};

// ── Speech helpers ──────────────────────────────────────────────
function speak(text, onEnd) {
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  utter.pitch = 1;
  utter.lang = 'en-US';
  if (onEnd) utter.onend = onEnd;
  window.speechSynthesis.speak(utter);
}

function useSpeechRecognition() {
  const recognitionRef = useRef(null);
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';

    r.onresult = (e) => {
      let final = '';
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
      }
      setTranscript(final.trim());
    };

    r.onend = () => setListening(false);
    recognitionRef.current = r;
  }, []);

  const startListening = () => {
    setTranscript('');
    recognitionRef.current?.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return { transcript, setTranscript, listening, startListening, stopListening };
}
// ───────────────────────────────────────────────────────────────

export default function InterviewSection({ position, resumeText }) {
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState([]);
  const [evaluating, setEvaluating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  const { transcript, setTranscript, listening, startListening, stopListening } = useSpeechRecognition();

  const speakQuestion = (text) => {
    setAiSpeaking(true);
    speak(text, () => setAiSpeaking(false));
  };

  const startInterview = async () => {
    setLoading(true);
    try {
      const data = await generateQuestions(position, resumeText, 'both');
      setQuestions(data.questions);
      setStarted(true);
      setCurrent(0);
      setResults([]);
      setFinished(false);
      // AI speaks first question after short delay
      setTimeout(() => speakQuestion(data.questions[0].question), 600);
    } catch {
      toast.error('Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!transcript.trim()) return toast.error('Please speak your answer first');
    window.speechSynthesis.cancel();
    setEvaluating(true);
    try {
      const q = questions[current];
      const evaluation = await evaluateAnswer(q.question, transcript, position);
      const newResults = [...results, { question: q, answer: transcript, evaluation }];
      setResults(newResults);
      setTranscript('');

      if (current + 1 >= questions.length) {
        setFinished(true);
        setTimeout(() => speak('Interview complete! Great job. Here are your results.'), 300);
      } else {
       const nextIdx = current + 1;
setCurrent(nextIdx);
setTimeout(() => speakQuestion(questions[nextIdx].question), 500);
      }
    } catch {
      toast.error('Failed to evaluate answer');
    } finally {
      setEvaluating(false);
    }
  };

  const reset = () => {
    window.speechSynthesis.cancel();
    setStarted(false);
    setQuestions([]);
    setCurrent(0);
    setTranscript('');
    setResults([]);
    setFinished(false);
  };

  const overallScore = finished
    ? Math.round(results.reduce((sum, r) => sum + r.evaluation.score, 0) / results.length * 10)
    : 0;

  const scoreColor = overallScore >= 70 ? 'text-green-400' : overallScore >= 40 ? 'text-yellow-400' : 'text-red-400';

  // ── Start Screen ─────────────────────────────────────────────
  if (!started) return (
    <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-6">
      <h2 className="text-2xl font-semibold">🎤 AI Voice Interview</h2>
      <p className="text-gray-400">
        A mock interview for <span className="text-white font-medium">"{position}"</span>.
        The AI will <strong className="text-white">speak each question</strong> aloud —
        you respond by <strong className="text-white">speaking your answer</strong>.
      </p>

      <div className="grid grid-cols-3 gap-4 text-center">
        {[['🎙️', 'AI reads questions aloud'], ['🗣️', 'You speak your answers'], ['📊', 'Get instant AI feedback']].map(([icon, text]) => (
          <div key={text} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-3xl mb-2">{icon}</div>
            <p className="text-sm text-gray-400">{text}</p>
          </div>
        ))}
      </div>

      <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4 text-sm text-yellow-300">
        ⚠️ Allow microphone access when prompted by your browser.
      </div>

      <button
        onClick={startInterview}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition"
      >
        {loading
          ? <><Loader2 className="animate-spin" size={20} /> Generating Questions...</>
          : '🚀 Start Voice Interview'}
      </button>
    </div>
  );

  // ── Finished Screen ──────────────────────────────────────────
  if (finished) return (
    <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Interview Complete! 🎉</h2>
        <p className={`text-6xl font-bold mt-4 ${scoreColor}`}>{overallScore}%</p>
        <p className="text-gray-400 mt-2">Overall Interview Score</p>
      </div>

      <div className="space-y-4">
        {results.map((r, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-5 space-y-3 border border-gray-700">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-white">Q{i + 1}. {r.question.question}</p>
              <span className={`shrink-0 text-xs px-2 py-1 rounded-full border ${TYPE_LABELS[r.question.type]?.color || 'text-gray-400 bg-gray-700 border-gray-600'}`}>
                {TYPE_LABELS[r.question.type]?.label || r.question.type}
              </span>
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              {[...Array(10)].map((_, idx) => (
                <Star key={idx} size={14}
                  className={idx < r.evaluation.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
              ))}
              <span className="text-sm text-gray-400 ml-2">{r.evaluation.score}/10</span>
            </div>

            <div className="bg-gray-900 rounded-lg p-3 text-sm text-gray-300">
              <p className="text-gray-500 text-xs mb-1">🎙️ Your Answer (transcribed):</p>
              {r.answer}
            </div>

            <div className="bg-blue-950/30 border border-blue-900 rounded-lg p-3 text-sm">
              <p className="text-blue-400 text-xs mb-1 font-medium">💬 AI Feedback:</p>
              <p className="text-gray-300">{r.evaluation.feedback}</p>
            </div>

            <div className="bg-green-950/30 border border-green-900 rounded-lg p-3 text-sm">
              <p className="text-green-400 text-xs mb-1 font-medium">✅ Ideal Answer:</p>
              <p className="text-gray-300">{r.evaluation.idealAnswer}</p>
            </div>

            {/* Replay question button */}
            <button
              onClick={() => speak(r.question.question)}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition"
            >
              <Volume2 size={14} /> Replay Question
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={reset}
        className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl py-3 font-medium transition"
      >
        <RotateCcw size={18} /> Retake Interview
      </button>
    </div>
  );

  // ── Active Interview Screen ──────────────────────────────────
  const q = questions[current];
  return (
    <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">🎤 Voice Interview</h2>
        <span className="text-sm text-gray-400">Question {current + 1} / {questions.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(current / questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-gray-800 rounded-xl p-6 space-y-3 border border-gray-700">
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full border ${TYPE_LABELS[q.type]?.color || 'text-gray-400 bg-gray-700 border-gray-600'}`}>
            {TYPE_LABELS[q.type]?.label || q.type}
          </span>
          <button
            onClick={() => speakQuestion(q.question)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
          >
            <Volume2 size={14} /> {aiSpeaking ? 'Speaking...' : 'Replay'}
          </button>
        </div>
        <p className="text-lg font-medium text-white leading-relaxed">{q.question}</p>
      </div>

      {/* Voice recorder */}
      <div className="flex flex-col items-center gap-4 py-4">
        <button
          onClick={listening ? stopListening : startListening}
          disabled={evaluating || aiSpeaking}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
            ${listening
              ? 'bg-red-600 hover:bg-red-700 scale-110 shadow-red-900/50'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/50'}
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {listening
            ? <MicOff size={36} className="text-white" />
            : <Mic size={36} className="text-white" />}
        </button>

        <p className="text-sm text-gray-400">
          {aiSpeaking
            ? '🔊 AI is speaking...'
            : listening
              ? '🔴 Recording... tap to stop'
              : '🎙️ Tap mic to speak your answer'}
        </p>

        {/* Pulse animation when listening */}
        {listening && (
          <div className="flex gap-1 items-end h-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 bg-red-500 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 24 + 8}px`,
                  animationDelay: `${i * 0.15}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Transcript box */}
      {transcript && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">📝 Transcribed Answer:</p>
          <p className="text-gray-200 text-sm leading-relaxed">{transcript}</p>
          <button
            onClick={() => setTranscript('')}
            className="text-xs text-red-400 hover:text-red-300 mt-2 transition"
          >
            ✕ Clear & Re-record
          </button>
        </div>
      )}

      <button
        onClick={submitAnswer}
        disabled={evaluating || !transcript.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition"
      >
        {evaluating
          ? <><Loader2 className="animate-spin" size={20} /> AI is evaluating...</>
          : current + 1 === questions.length
            ? <><CheckCircle size={20} /> Submit Final Answer</>
            : <><ChevronRight size={20} /> Submit & Next Question</>}
      </button>
    </div>
  );
}