'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/store/ui-store';
import { uploadService } from '@/lib/api/upload-service';
import { UploadCloud, Music, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// GraphQL Mutation for creating song metadata
const CREATE_SONG_MUTATION = gql`
  mutation CreateSong($input: CreateSongInput!) {
    createSong(input: $input) {
      id
      title
      artist
      duration
      fileId
    }
  }
`;

const songSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    artist: z.string().min(1, 'Artist is required'),
});

type SongInput = z.infer<typeof songSchema>;

export function SongUploadForm() {
    const router = useRouter();
    const { addNotification } = useUIStore();
    const [file, setFile] = useState<File | null>(null);
    const [duration, setDuration] = useState<number>(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [createSong] = useMutation(CREATE_SONG_MUTATION);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<SongInput>({
        resolver: zodResolver(songSchema),
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        if (!selectedFile.type.startsWith('audio/')) {
            addNotification({ message: 'Please select an audio file', type: 'error' });
            return;
        }

        // Get duration
        const audio = new Audio();
        audio.src = URL.createObjectURL(selectedFile);
        audio.onloadedmetadata = () => {
            setDuration(Math.round(audio.duration));
            URL.revokeObjectURL(audio.src);
        };

        setFile(selectedFile);
        // Auto-fill title if empty
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
        setValue('title', fileName);
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            validateAndSetFile(droppedFile);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onSubmit = async (data: SongInput) => {
        if (!file) {
            addNotification({ message: 'Please select a file', type: 'error' });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // 1. Upload file to REST API
            const uploadResponse = await uploadService.uploadSong(
                file,
                { ...data, duration: duration.toString() },
                (progress) => setUploadProgress(progress)
            );

            // 2. Create metadata in GraphQL
            await createSong({
                variables: {
                    input: {
                        title: data.title,
                        artist: data.artist,
                        duration: duration,
                        fileId: uploadResponse.fileId,
                    },
                },
                refetchQueries: ['Songs'], // Optionally refetch song list
            });

            addNotification({ message: 'Song uploaded successfully!', type: 'success' });
            router.push('/songs');
        } catch (error) {
            console.error(error);
            addNotification({
                message: error instanceof Error ? error.message : 'Upload failed',
                type: 'error'
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card variant="glass" className="max-w-xl mx-auto border-violet-500/20">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    Upload New Song
                </h2>
                <p className="text-gray-400 text-sm mt-1">Share your music with the world</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* File Drop Zone */}
                <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer 
                ${file ? 'border-violet-500/50 bg-violet-500/5' : 'border-white/10 hover:border-violet-500/30 hover:bg-white/5'}`}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    {file ? (
                        <div className="flex items-center justify-center gap-4">
                            <div className="p-3 bg-violet-500/20 rounded-full text-violet-400">
                                <Music size={24} />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-medium truncate max-w-[200px]">{file.name}</p>
                                <p className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                className="ml-4 p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="mx-auto w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-400">
                                <UploadCloud size={24} />
                            </div>
                            <p className="text-gray-300 font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">MP3, WAV, FLAC (Max 50MB)</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <Input
                        label="Title"
                        {...register('title')}
                        error={errors.title?.message}
                        placeholder="Song Title"
                    />
                    <Input
                        label="Artist"
                        {...register('artist')}
                        error={errors.artist?.message}
                        placeholder="Artist Name"
                    />
                </div>

                {isUploading && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Uploading...</span>
                            <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="pt-2">
                    <Button
                        variant="glow"
                        type="submit"
                        className="w-full"
                        isLoading={isUploading}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Song'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
