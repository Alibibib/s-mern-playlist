'use client';

import { useSubscription as useApolloSubscription } from '@apollo/client/react';
import { useEffect } from 'react';
import { useUIStore } from '@/lib/store/ui-store';

export function useSubscription<TData = any, TVariables = any>(
  subscription: any,
  options?: {
    variables?: TVariables;
    onData?: (data: TData) => void;
    onError?: (error: Error) => void;
    skip?: boolean;
  }
) {
  const { addNotification } = useUIStore();

  const { data, loading, error } = useApolloSubscription<TData, TVariables>(
    subscription,
    {
      variables: options?.variables,
      skip: options?.skip,
      onError: (error) => {
        console.error('Subscription error:', error);
        addNotification({
          message: 'Connection error. Trying to reconnect...',
          type: 'error',
        });
        if (options?.onError) {
          options.onError(error);
        }
      },
    }
  );

  useEffect(() => {
    if (data && options?.onData) {
      options.onData(data);
    }
  }, [data, options]);

  return {
    data,
    loading,
    error,
  };
}
