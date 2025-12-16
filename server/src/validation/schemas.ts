import { z } from 'zod';

// === User schemas ===
export const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Invalid email format').trim().toLowerCase(),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long'),
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').trim(),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').trim(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format').trim().toLowerCase(),
    password: z.string().min(1, 'Password is required'),
});

// === Song schemas ===
export const createSongSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters').trim(),
    artist: z.string().min(1, 'Artist is required').max(100, 'Artist must be at most 100 characters').trim(),
    duration: z
        .number()
        .int('Duration must be an integer')
        .min(1, 'Duration must be at least 1 second')
        .max(7200, 'Duration must be at most 2 hours (7200 seconds)'),
    fileId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid fileId format (must be MongoDB ObjectId)'),
});

// === Playlist schemas ===
export const createPlaylistSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters').trim(),
    description: z.string().max(500, 'Description must be at most 500 characters').trim().optional().default(''),
    isPublic: z.boolean().optional().default(true),
});

export const updatePlaylistSchema = z
    .object({
        title: z.string().min(1, 'Title cannot be empty').max(100, 'Title must be at most 100 characters').trim().optional(),
        description: z.string().max(500, 'Description must be at most 500 characters').trim().optional(),
        isPublic: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided',
    });

// === Contributor schemas ===
export const addContributorSchema = z.object({
    playlistId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid playlistId format'),
    userId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid userId format'),
    role: z.enum(['VIEWER', 'EDITOR', 'ADMIN'], {
        errorMap: () => ({ message: 'Role must be VIEWER, EDITOR, or ADMIN' }),
    }),
});

// === Common schemas ===
export const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');
export const songIdsArraySchema = z.array(mongoIdSchema).min(1, 'At least one song ID is required').max(200, 'Too many song IDs');

// Type exports (inferred)
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateSongInput = z.infer<typeof createSongSchema>;
export type CreatePlaylistInput = z.infer<typeof createPlaylistSchema>;
export type UpdatePlaylistInput = z.infer<typeof updatePlaylistSchema>;
export type AddContributorInput = z.infer<typeof addContributorSchema>;
