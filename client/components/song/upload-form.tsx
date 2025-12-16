'use client';

import React, { useState } from 'react';
import { API_URL } from '@/lib/utils/constants';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function UploadForm() {
  const { token } = useAuthStore();
  const { addNotification } = useUIStore();
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
        throw new Error('Upload failed');
      }

      const result = await response.json();
      addNotification({
        message: 'File uploaded successfully!',
        type: 'success',
      });

      // Reset form
      setFormData({ title: '', artist: '', duration: '' });
      setFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload file';
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
