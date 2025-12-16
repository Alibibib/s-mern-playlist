'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '@/lib/graphql/queries/auth.queries';
import { useEffect } from 'react';

export function useAuth() {
  const router = useRouter();
  const { token, user, login, logout, setUser } = useAuthStore();
  const isAuthenticated = !!token && !!user;

  // Загружаем данные пользователя если есть токен
  const { data, loading, error } = useQuery(ME_QUERY, {
    skip: !token,
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
      }
    },
    onError: () => {
      // Если токен невалидный, выходим
      logout();
    },
  });

  useEffect(() => {
    if (token && data?.me) {
      setUser(data.me);
    }
  }, [token, data, setUser]);

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
