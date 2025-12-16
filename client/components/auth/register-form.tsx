'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { registerSchema, type RegisterInput } from '@/lib/validation/schemas';
import { REGISTER_MUTATION } from '@/lib/graphql/mutations/auth.mutations';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import type { User } from '@/types';

interface RegisterMutationData {
  register: {
    token: string;
    user: User;
  };
}

interface RegisterMutationVariables {
  input: RegisterInput;
}

export function RegisterForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { addNotification } = useUIStore();
  const [registerMutation, { loading }] = useMutation<RegisterMutationData, RegisterMutationVariables>(REGISTER_MUTATION);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const result = await registerMutation({
        variables: { input: data },
      });

      if (result.data?.register) {
        const { token, user } = result.data.register;
        login(token, user);
        addNotification({
          message: 'Successfully registered!',
          type: 'success',
        });
        router.push('/playlists');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.';
      addNotification({
        message: errorMessage,
        type: 'error',
      });
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username"
          {...register('username')}
          error={errors.username?.message}
        />
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
        <Input
          label="First Name"
          {...register('firstName')}
          error={errors.firstName?.message}
        />
        <Input
          label="Last Name"
          {...register('lastName')}
          error={errors.lastName?.message}
        />
        <Button type="submit" isLoading={loading} className="w-full">
          Register
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Login
        </a>
      </p>
    </Card>
  );
}
