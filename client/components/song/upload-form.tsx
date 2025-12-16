'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { API_URL } from '@/lib/utils/constants';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';
import { CREATE_SONG_MUTATION } from '@/lib/graphql/mutations/song.mutations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/utils/error';

interface CreateSongMutationData {
  createSong: {
    id: string;
    title: string;
    artist: string;
    duration: number;
    fileId: string;
    uploadedBy: {
      id: string;
      username: string;
    };
    createdAt: string;
  };
}

interface CreateSongMutationVariables {
  input: {
    title: string;
    artist: string;
    duration: number;
    fileId: string;
  };
}

export function UploadForm() {
  const { token } = useAuthStore();
  const { addNotification } = useUIStore();
  const [createSong] = useMutation<CreateSongMutationData, CreateSongMutationVariables>(CREATE_SONG_MUTATION);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    duration: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !token) return;

    setLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('audio', file);
      uploadData.append('title', formData.title);
      uploadData.append('artist', formData.artist);
      uploadData.append('duration', formData.duration);

      const response = await fetch(`${API_URL}/api/upload/upload`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        addNotification({
          message: errorMessage,
          type: 'error',
        });
        return;
      }

      const uploadResult = await response.json();
      const fileId = uploadResult.fileId;

      if (!fileId) {
        addNotification({
          message: 'File uploaded but fileId not received',
          type: 'error',
        });
        return;
      }

      // Create song record via GraphQL
      try {
        await createSong({
          variables: {
            input: {
              title: formData.title,
              artist: formData.artist,
              duration: parseInt(formData.duration, 10),
              fileId,
            },
          },
        });
        addNotification({
          message: 'Song uploaded and created successfully!',
          type: 'success',
        });

        // Reset form
        setFormData({ title: '', artist: '', duration: '' });
        setFile(null);
      } catch (graphqlError) {
        const errorMessage = getErrorMessage(
          graphqlError,
          'File uploaded but failed to create song record'
        );
        addNotification({
          message: errorMessage,
          type: 'error',
        });
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to upload file');
      addNotification({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4">Upload Song</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          required
        />
        <Input
          label="Artist"
          value={formData.artist}
          onChange={(e) =>
            setFormData({ ...formData, artist: e.target.value })
          }
          required
        />
        <Input
          label="Duration (seconds)"
          type="number"
          value={formData.duration}
          onChange={(e) =>
            setFormData({ ...formData, duration: e.target.value })
          }
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Audio File
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <Button type="submit" isLoading={loading} className="w-full">
          Upload
        </Button>
      </form>
    </Card>
  );
}
