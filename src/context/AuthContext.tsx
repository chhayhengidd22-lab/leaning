import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { api, authStorage } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (name: string, email: string, pass: string, username?: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; username?: string; avatar?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isStudent: false,
  login: async () => { throw new Error('Not implemented'); },
  register: async () => { throw new Error('Not implemented'); },
  logout: async () => {},
  updateProfile: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api.getMe()
      .then(res => {
        if (res.success && res.data.user) {
          setUser(res.data.user);
        } else {
          authStorage.clearToken();
        }
      })
      .catch(() => {
        authStorage.clearToken();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await api.login(email, pass);
    if (res.success && res.data) {
      authStorage.setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name: string, email: string, pass: string, username?: string): Promise<User> => {
    const res = await api.register(name, email, pass, username);
    if (res.success && res.data) {
      authStorage.setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      authStorage.clearToken();
      setUser(null);
    }
  };

  const updateProfile = async (data: { name?: string; username?: string; avatar?: string }) => {
    const res = await api.updateProfile(data);
    if (res.success && res.data.user) {
      setUser(res.data.user);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isStudent, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
