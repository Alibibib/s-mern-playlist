'use client';

import { useSubscription as useApolloSubscription } from '@apollo/client/react';
import type { OperationVariables } from '@apollo/client';
import { useEffect } from 'react';
import { useUIStore } from '@/lib/store/ui-store';

export function useSubscription<TData = any, TVariables extends OperationVariables = Record<string, never>>(
  subscription: any,
  options?: {
    variables?: TVariables;
    onData?: (data: TData) => void;
    onError?: (error: Error) => void;
    skip?: boolean;
  }
) {
  const { addNotification } = useUIStore();

  const subscriptionOptions = {
    ...(options?.variables && { variables: options.variables }),
    ...(options?.skip !== undefined && { skip: options.skip }),
    onError: (error: any) => {
      console.error('Subscription error:', error);
      addNotification({
        message: 'Connection error. Trying to reconnect...',
        type: 'error',
      });
      if (options?.onError) {
        options.onError(error);
      }
    },
  };

  const { data, loading, error } = useApolloSubscription<TData, TVariables>(
    subscription,
    subscriptionOptions as any
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
