'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore, useIsAuthenticated } from '@/lib/store/auth-store';
import { useQuery } from '@apollo/client/react';
import { ME_QUERY } from '@/lib/graphql/queries/auth.queries';
import { useEffect } from 'react';
import type { User } from '@/types';

interface MeQueryData {
  me: User;
}

export function useAuth() {
  const router = useRouter();
  const { token, user, login, logout, setUser } = useAuthStore();
  const isAuthenticated = useIsAuthenticated();

  // Загружаем данные пользователя если есть токен
  const { data, loading, error } = useQuery<MeQueryData>(ME_QUERY, {
    skip: !token,
  });

  useEffect(() => {
    if (token && data?.me) {
      setUser(data.me);
    }
  }, [token, data, setUser]);

  useEffect(() => {
    if (error) {
      // Если токен невалидный, выходим
      logout();
    }
  }, [error, logout]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    logout: handleLogout,
  };
}
