'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { loginSchema, type LoginInput } from '@/lib/validation/schemas';
import { LOGIN_MUTATION } from '@/lib/graphql/mutations/auth.mutations';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import type { User } from '@/types';

interface LoginMutationData {
  login: {
    token: string;
    user: User;
  };
}

interface LoginMutationVariables {
  input: LoginInput;
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { addNotification } = useUIStore();
  const [loginMutation, { loading }] = useMutation<LoginMutationData, LoginMutationVariables>(LOGIN_MUTATION);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const result = await loginMutation({
        variables: { input: data },
      });

      if (result.data?.login) {
        const { token, user } = result.data.login;
        login(token, user);
        addNotification({
          message: 'Successfully logged in!',
          type: 'success',
        });
        router.push('/playlists');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed. Please try again.';
      addNotification({
        message: errorMessage,
        type: 'error',
      });
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
        <Button type="submit" isLoading={loading} className="w-full">
          Login
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Don&#39;t have an account?{' '}
        <a href="/register" className="text-blue-600 hover:underline">
          Register
        </a>
      </p>
    </Card>
  );
}
