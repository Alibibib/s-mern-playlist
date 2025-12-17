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
    <Card variant="glass" className="max-w-md mx-auto mt-8 border-violet-500/20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Welcome Back</h2>
        <p className="text-gray-400 text-sm mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="your@email.com"
        />
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          placeholder="••••••••"
        />
        <Button variant="glow" type="submit" isLoading={loading} className="w-full">
          Login
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        Don&#39;t have an account?{' '}
        <a href="/register" className="text-violet-400 hover:text-violet-300 hover:underline transition-colors font-medium">
          Register
        </a>
      </p>
    </Card>
  );
}
