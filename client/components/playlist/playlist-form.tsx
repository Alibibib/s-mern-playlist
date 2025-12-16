'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPlaylistSchema, type CreatePlaylistInput } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface PlaylistFormProps {
  onSubmit: (data: CreatePlaylistInput) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<CreatePlaylistInput>;
}

export function PlaylistForm({
  onSubmit,
  isLoading = false,
  initialData,
}: PlaylistFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePlaylistInput>({
    resolver: zodResolver(createPlaylistSchema),
    defaultValues: {
      isPublic: false,
      ...initialData,
    },
  });

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title"
          {...register('title')}
          error={errors.title?.message}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            {...register('isPublic')}
            className="mr-2"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700">
            Make this playlist public
          </label>
        </div>
        <Button type="submit" isLoading={isLoading} className="w-full">
          {initialData ? 'Update Playlist' : 'Create Playlist'}
        </Button>
      </form>
    </Card>
  );
}
