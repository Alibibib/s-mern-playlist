'use client';

import { useSubscription as useApolloSubscription } from '@apollo/client/react';
import type { OperationVariables, DocumentNode } from '@apollo/client';
import { useEffect } from 'react';
import { useUIStore } from '@/lib/store/ui-store';

export function useSubscription<
  TData = unknown,
  TVariables extends OperationVariables = Record<string, never>
>(
  subscription: DocumentNode,
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
    onError: (error: Error | { message?: string }) => {
      console.error('Subscription error:', error);
      addNotification({
        message: 'Connection error. Trying to reconnect...',
        type: 'error',
      });
      if (options?.onError) {
        const errorInstance =
          error instanceof Error ? error : new Error(error.message || 'Unknown error');
        options.onError(errorInstance);
      }
    },
  };

  const { data, loading, error } = useApolloSubscription<TData, TVariables>(
    subscription,
    subscriptionOptions
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
