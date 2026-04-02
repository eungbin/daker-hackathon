import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useMobileDrawer } from '../store/MobileDrawerContext';


const bottomNavItems = [
  {
    label: '홈', path: '/', exact: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: '해커톤', path: '/hackathons', exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    label: '캠프', path: '/camp', exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: '랭킹', path: '/rankings', exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { drawerContent, isOpen, openDrawer, closeDrawer } = useMobileDrawer();

  const isActive = (path: string, exact: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D10] border-b border-[#1e1e24]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Left: hamburger (mobile) + logo + desktop nav */}
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only, shown when page has drawer content */}
            {drawerContent && (
              <button
                onClick={openDrawer}
                className="md:hidden w-8 h-8 flex flex-col justify-center items-center gap-1.5"
                aria-label="메뉴 열기"
              >
                <span className="block w-5 h-0.5 bg-gray-300" />
                <span className="block w-5 h-0.5 bg-gray-300" />
                <span className="block w-5 h-0.5 bg-gray-300" />
              </button>
            )}
            <Link to="/" className="text-white font-bold text-lg tracking-wider">HACKLOG</Link>
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6 ml-5">
              {bottomNavItems.filter(i => i.path !== '/').map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium pb-0.5 border-b-2 transition-colors ${
                    isActive(item.path, item.exact)
                      ? 'text-white border-primary'
                      : 'text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: user */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-card-border rounded-xl px-3 py-1.5 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/60 to-purple-700/60 flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-white font-medium hidden md:inline">{currentUser.username}</span>
                  <svg className="w-3 h-3 text-gray-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
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
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <>
        {/* Backdrop */}
        <div
          className={`md:hidden fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={closeDrawer}
        />
        {/* Drawer panel */}
        <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#111115] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-card-border shrink-0">
              <span className="text-white font-bold text-lg tracking-wider">HACKLOG</span>
              <button
                onClick={closeDrawer}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Injected content */}
            <div className="flex-1 overflow-y-auto">
              {drawerContent}
            </div>

            {/* User info footer */}
            <div className="border-t border-card-border p-4 shrink-0">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/60 to-purple-700/60 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-semibold truncate">{currentUser.username}</p>
                    <p className="text-gray-500 text-xs truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => { logout(); closeDrawer(); }}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-900/20 shrink-0"
                    title="로그아웃"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={closeDrawer}
                  className="block text-center text-sm bg-primary text-white py-2 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  로그인
                </Link>
              )}
            </div>
        </div>
      </>

      {/* Bottom tab bar — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D10] border-t border-card-border">
        <div className="flex">
          {bottomNavItems.map(item => {
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${
                  active ? 'text-primary' : 'text-gray-600'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
