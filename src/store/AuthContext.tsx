import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

const USERS_KEY = 'hacklog_users';
const SESSION_KEY = 'hacklog_session';

function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

interface AuthContextType {
  currentUser: User | null;
  register: (username: string, email: string, password: string) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const sessionId = localStorage.getItem(SESSION_KEY);
      if (!sessionId) return null;
      const users = getUsers();
      return users.find(u => u.id === sessionId) ?? null;
    } catch {
      return null;
    }
  });

  const register = useCallback((username: string, email: string, password: string) => {
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      return { ok: false, error: '이미 사용 중인 이메일입니다.' };
    }
    if (users.some(u => u.username === username)) {
      return { ok: false, error: '이미 사용 중인 닉네임입니다.' };
    }
    const user: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    const updated = [...users, user];
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    localStorage.setItem(SESSION_KEY, user.id);
    setCurrentUser(user);
    return { ok: true };
  }, []);

  const login = useCallback((email: string, password: string) => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    localStorage.setItem(SESSION_KEY, user.id);
    setCurrentUser(user);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
