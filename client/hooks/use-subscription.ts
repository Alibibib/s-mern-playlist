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

  // Build options object conditionally to satisfy Apollo's conditional overloads
  const subscriptionOptions: {
    variables?: TVariables;
    skip?: boolean;
    onError?: (error: Error) => void;
  } = {};

  if (options?.variables) {
    subscriptionOptions.variables = options.variables;
  }

  if (options?.skip !== undefined) {
    subscriptionOptions.skip = options.skip;
  }

  subscriptionOptions.onError = (error: Error) => {
    console.error('Subscription error:', error);
    addNotification({
      message: 'Connection error. Trying to reconnect...',
      type: 'error',
    });
    if (options?.onError) {
      options.onError(error);
    }
  };

  // Type assertion needed due to Apollo's conditional overload types
  const { data, loading, error } = useApolloSubscription<TData, TVariables>(
    subscription,
    // @ts-expect-error - Apollo's conditional overload types are complex
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
