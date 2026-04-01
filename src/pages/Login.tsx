import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = login(form.email, form.password);
    setLoading(false);
    if (result.ok) {
      navigate(-1);
    } else {
      setError(result.error || '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="flex-1 bg-neutral flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-white font-bold text-2xl tracking-wider">HACKLOG</Link>
          <p className="text-gray-500 text-sm mt-2">해커톤 플랫폼에 오신 것을 환영합니다</p>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8">
          <h1 className="text-white font-bold text-xl mb-6">로그인</h1>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">이메일</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full bg-neutral border border-card-border rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">비밀번호</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full bg-neutral border border-card-border rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-primary/30 mt-2"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            계정이 없으신가요?{' '}
            <Link to="/register" className="text-primary hover:underline">회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
