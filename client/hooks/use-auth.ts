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
  const { token, user, login, logout, setUser, _hasHydrated } = useAuthStore();
  const isAuthenticated = useIsAuthenticated();

  // Загружаем данные пользователя если есть токен
  const { data, loading: queryLoading, error } = useQuery<MeQueryData>(ME_QUERY, {
    skip: !token,
  });

  useEffect(() => {
    console.log('🔄 useAuth Effect:', { token: !!token, hasData: !!data?.me, error });
    if (token && data?.me) {
      setUser(data.me);
    }
  }, [token, data, setUser, error]);

  useEffect(() => {
    if (error) {
      console.error('❌ useAuth Error:', error);
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
    loading: queryLoading || !_hasHydrated,
    error,
    login,
    logout: handleLogout,
  };
}
