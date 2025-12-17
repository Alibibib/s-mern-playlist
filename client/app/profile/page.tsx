'use client';

import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@apollo/client/react';
import { ME_QUERY } from '@/lib/graphql/queries/auth.queries';
import { ProtectedRoute } from '@/components/ui/protected-route';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Error } from '@/components/ui/error';
import { formatDate } from '@/lib/utils/format';
import type { User } from '@/types';

interface MeQueryData {
  me: User;
}

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const { data, loading, error } = useQuery<MeQueryData>(ME_QUERY, {
    skip: !isAuthenticated,
  });

  const displayUser = (data?.me as User | undefined) || user;

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <Error message={error.message || 'Failed to load profile'} />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-glow">Profile</h1>
          <Card variant="glass" className="border-violet-500/20">
            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl font-bold shadow-lg shadow-violet-500/30">
                  {displayUser?.firstName?.[0]}{displayUser?.lastName?.[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{displayUser?.firstName} {displayUser?.lastName}</h2>
                  <p className="text-gray-400">@{displayUser?.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Email</label>
                  <p className="text-lg text-white mt-1 font-light">{displayUser?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Member Since</label>
                  <p className="text-lg text-white mt-1 font-light">
                    {displayUser?.createdAt
                      ? formatDate(displayUser.createdAt)
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 flex justify-end">
                <Button variant="danger" onClick={logout} className="hover:bg-red-500/20">
                  Logout
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
