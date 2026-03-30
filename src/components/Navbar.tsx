import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const navItems = [
  { label: 'Hackathons', path: '/hackathons' },
  { label: 'Camp', path: '/camp' },
  { label: 'Rankings', path: '/rankings' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D10] border-b border-[#1e1e24]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-white font-bold text-lg tracking-wider">HACKLOG</Link>
          <div className="hidden sm:flex items-center gap-6">
            {navItems.map(item => {
              const active = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium pb-0.5 border-b-2 transition-colors ${
                    active
                      ? 'text-white border-primary'
                      : 'text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-card-border rounded-xl px-3 py-1.5 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/60 to-purple-700/60 flex items-center justify-center text-white text-xs font-bold">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-white font-medium">{currentUser.username}</span>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-card-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-card-border">
                      <p className="text-white text-sm font-semibold">{currentUser.username}</p>
                      <p className="text-gray-500 text-xs truncate">{currentUser.email}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => { navigate('/rankings'); setShowUserMenu(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        내 랭킹 보기
                      </button>
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
              >
                로그인
              </Link>
              <Link
                to="/register"
                className="text-sm bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-1.5 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30"
              >
                회원가입
              </Link>
            </div>
          )}
          {/* Mobile hamburger */}
          <button
            className="sm:hidden flex flex-col gap-1.5 p-1.5"
            onClick={() => setShowMobileMenu(v => !v)}
            aria-label="메뉴 열기"
          >
            <span className={`block w-5 h-0.5 bg-gray-300 transition-all origin-center ${showMobileMenu ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-300 transition-all ${showMobileMenu ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-300 transition-all origin-center ${showMobileMenu ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {showMobileMenu && (
        <>
          <div className="fixed inset-0 z-40 top-14" onClick={() => setShowMobileMenu(false)} />
          <div className="sm:hidden absolute top-full left-0 right-0 z-50 bg-[#0D0D10] border-b border-[#1e1e24] px-6 py-3 flex flex-col gap-1">
            {navItems.map(item => {
              const active = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`text-sm font-medium py-2.5 border-b border-card-border last:border-0 transition-colors ${
                    active ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </nav>
  );
}
