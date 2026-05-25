import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../api/resumeApi';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let data;
      if (isLogin) {
        data = await loginUser(form.email, form.password);
      } else {
        if (!form.name.trim()) return toast.error('Name is required');
        data = await registerUser(form.name, form.email, form.password);
      }
      login(data.user, data.token);
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-6">

        <div className="text-center">
          <span className="text-4xl">🎯</span>
          <h1 className="text-2xl font-bold mt-2">ResumeAI Analyser</h1>
          <p className="text-gray-400 mt-1">
            {isLogin ? 'Sign in to your account' : 'Create a free account'}
          </p>
        </div>

        <div className="flex bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              isLogin ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              !isLogin ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3
                         text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3
                       text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3
                       text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                     rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition"
        >
          {loading
            ? <><Loader2 className="animate-spin" size={20} /> Please wait...</>
            : isLogin ? '🔐 Login' : '🚀 Create Account'}
        </button>
      </div>
    </div>
  );
}