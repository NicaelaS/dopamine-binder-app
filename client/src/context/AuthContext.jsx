import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BASE_URL, fetchProfile } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await fetchProfile();
      setUser(data.user ?? null);
      return data.user ?? null;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const loginWithGoogle = () => {
    window.location.href = `${BASE_URL}/auth/google`;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      loginWithGoogle,
      refreshUser,
      setUser,
    }),
    [user, loading, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
