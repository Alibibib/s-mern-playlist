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
      <div className="min-h-screen bg-gray-50 p-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Error message={error.message || 'Failed to load profile'} />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Profile</h1>
          <Card>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Username
                </label>
                <p className="text-lg">{displayUser?.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{displayUser?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  First Name
                </label>
                <p className="text-lg">{displayUser?.firstName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Name
                </label>
                <p className="text-lg">{displayUser?.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Member Since
                </label>
                <p className="text-lg">
                  {displayUser?.createdAt
                    ? formatDate(displayUser.createdAt)
                    : 'N/A'}
                </p>
              </div>
              <div className="pt-4 border-t">
                <Button variant="danger" onClick={logout}>
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
