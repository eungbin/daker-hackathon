import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim()) { setError('닉네임을 입력해주세요.'); return; }
    if (form.password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
    if (form.password !== form.confirm) { setError('비밀번호가 일치하지 않습니다.'); return; }

    setLoading(true);
    const result = register(form.username.trim(), form.email, form.password);
    setLoading(false);

    if (result.ok) {
      navigate('/');
    } else {
      setError(result.error || '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="flex-1 bg-neutral flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-white font-bold text-2xl tracking-wider">HACKLOG</Link>
          <p className="text-gray-500 text-sm mt-2">새 계정을 만들어 해커톤에 참여하세요</p>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8">
          <h1 className="text-white font-bold text-xl mb-6">회원가입</h1>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">닉네임</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="CyberArchitect"
                className="w-full bg-neutral border border-card-border rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

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
                placeholder="6자 이상"
                className="w-full bg-neutral border border-card-border rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">비밀번호 확인</label>
              <input
                type="password"
                required
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="••••••••"
                className="w-full bg-neutral border border-card-border rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-primary/30 mt-2"
            >
              {loading ? '처리 중...' : '계정 만들기'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-primary hover:underline">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
