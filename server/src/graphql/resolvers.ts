import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { PubSub, withFilter } from 'graphql-subscriptions';
import User, { IUser } from '../models/User';
import Playlist, { IPlaylist } from '../models/Playlist';
import Song, { ISong } from '../models/Song';
import PlaylistSong, { IPlaylistSong } from '../models/PlaylistSong';
import Contributor, { IContributor, ContributorRole } from '../models/Contributor';

const pubsub = new PubSub();

// Subscription events
const USER_CREATED = 'USER_CREATED';
const PLAYLIST_UPDATED = 'PLAYLIST_UPDATED';
const SONG_ADDED_TO_PLAYLIST = 'SONG_ADDED_TO_PLAYLIST';
const SONG_REMOVED_FROM_PLAYLIST = 'SONG_REMOVED_FROM_PLAYLIST';
const CONTRIBUTOR_ADDED = 'CONTRIBUTOR_ADDED';

interface Context {
    user?: {
        id: string;
        email: string;
    };
}

interface RegisterInput {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

interface LoginInput {
    email: string;
    password: string;
}

interface CreatePlaylistInput {
    title: string;
    description?: string;
    isPublic?: boolean;
}

interface UpdatePlaylistInput {
    title?: string;
    description?: string;
    isPublic?: boolean;
}

interface CreateSongInput {
    title: string;
    artist: string;
    duration: number;
    fileId: string;
}

interface AddContributorInput {
    playlistId: string;
    userId: string;
    role: ContributorRole;
}

const generateToken = (user: IUser): string => {
    return jwt.sign(
        { id: user._id.toString(), email: user.email },
        process.env.JWT_SECRET || 'unsafe_secret_key',
        { expiresIn: '7d' }
    );
};

const formatUser = (user: IUser) => ({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
});

const formatPlaylist = (playlist: IPlaylist) => ({
    id: playlist._id.toString(),
    title: playlist.title,
    description: playlist.description,
    ownerId: playlist.ownerId.toString(),
    isPublic: playlist.isPublic,
    createdAt: playlist.createdAt.toISOString(),
    updatedAt: playlist.updatedAt.toISOString(),
});

const formatSong = (song: ISong) => ({
    id: song._id.toString(),
    title: song.title,
    artist: song.artist,
    duration: song.duration,
    fileId: song.fileId.toString(),
    uploadedById: song.uploadedBy.toString(),
    createdAt: song.createdAt.toISOString(),
    updatedAt: song.updatedAt.toISOString(),
});

const formatPlaylistSong = (playlistSong: IPlaylistSong) => ({
    id: playlistSong._id.toString(),
    playlistId: playlistSong.playlistId.toString(),
    songId: playlistSong.songId.toString(),
    addedById: playlistSong.addedBy.toString(),
    order: playlistSong.order,
    createdAt: playlistSong.createdAt.toISOString(),
});

const formatContributor = (contributor: IContributor) => ({
    id: contributor._id.toString(),
    playlistId: contributor.playlistId.toString(),
    userId: contributor.userId.toString(),
    role: contributor.role,
    invitedById: contributor.invitedBy.toString(),
    createdAt: contributor.createdAt.toISOString(),
});

const validateRegisterInput = (input: RegisterInput) => {
    const errors: Record<string, string> = {};

    if (!input.username || input.username.trim().length < 3) {
        errors.username = 'Username must be at least 3 characters';
    }
    if (!input.email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(input.email)) {
        errors.email = 'Invalid email format';
    }
    if (!input.password || input.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }
    if (!input.firstName || input.firstName.trim().length === 0) {
        errors.firstName = 'First name is required';
    }
    if (!input.lastName || input.lastName.trim().length === 0) {
        errors.lastName = 'Last name is required';
    }

    if (Object.keys(errors).length > 0) {
        throw new GraphQLError('Validation errors', {
            extensions: {
                code: 'VALIDATION_ERROR',
                errors,
            },
        });
    }
};

// Authorization helper
const checkPlaylistAccess = async (playlistId: string, userId: string, requiredRole?: ContributorRole) => {
    const playlist = await Playlist.findOne({ _id: playlistId, isDeleted: false });

    if (!playlist) {
        throw new GraphQLError('Playlist not found', {
            extensions: { code: 'NOT_FOUND' },
        });
    }


    // Owner has full access
    console.log('🔍 Checking access:', {
        playlistOwnerId: playlist.ownerId.toString(),
        userId: userId,
        match: playlist.ownerId.toString() === userId
    });

    if (playlist.ownerId.toString() === userId) {
        return { playlist, isOwner: true, role: ContributorRole.ADMIN };
    }


    // Check contributor access
    const contributor = await Contributor.findOne({
        playlistId,
        userId,
        isDeleted: false
    });

    if (!contributor) {
        throw new GraphQLError('Access denied', {
            extensions: { code: 'FORBIDDEN' },
        });
    }

    if (requiredRole) {
        const roleHierarchy = {
            [ContributorRole.VIEWER]: 0,
            [ContributorRole.EDITOR]: 1,
            [ContributorRole.ADMIN]: 2,
        };

        if (roleHierarchy[contributor.role] < roleHierarchy[requiredRole]) {
            throw new GraphQLError('Insufficient permissions', {
                extensions: { code: 'FORBIDDEN' },
            });
        }
    }

    return { playlist, isOwner: false, role: contributor.role };
};

export const resolvers = {
    Query: {
        hello: () => 'Hello from MERN Playlist Server!',

        // User queries
        me: async (_: any, __: any, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            const user = await User.findOne({
                _id: context.user.id,
                isDeleted: false
            });

            if (!user) {
                throw new GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            return formatUser(user);
        },

        users: async (_: any, __: any, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            const users = await User.find({ isDeleted: false });
            return users.map((user) => formatUser(user));
        },

        user: async (_: any, { id }: { id: string }, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            const user = await User.findOne({ _id: id, isDeleted: false });

            if (!user) {
                throw new GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            return formatUser(user);
        },

        // Playlist queries
        playlists: async (_: any, __: any, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            const playlists = await Playlist.find({ isDeleted: false });
            return playlists.map(formatPlaylist);
        },

        playlist: async (_: any, { id }: { id: string }, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            const playlist = await Playlist.findOne({ _id: id, isDeleted: false });

            if (!playlist) {
                throw new GraphQLError('Playlist not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            // Check access
            if (!playlist.isPublic && playlist.ownerId.toString() !== context.user.id) {
                const contributor = await Contributor.findOne({
                    playlistId: id,
                    userId: context.user.id,
                    isDeleted: false
                });

                if (!contributor) {
                    throw new GraphQLError('Access denied', {
                        extensions: { code: 'FORBIDDEN' },
                    });
                }
            }

            return formatPlaylist(playlist);
        },

        myPlaylists: async (_: any, __: any, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            const playlists = await Playlist.find({
                ownerId: context.user.id,
                isDeleted: false
            });

            return playlists.map(formatPlaylist);
        },

        publicPlaylists: async (_: any, __: any, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            const playlists = await Playlist.find({
                isPublic: true,
                isDeleted: false
            });

            return playlists.map(formatPlaylist);
        },

        // Song queries
        songs: async (_: any, __: any, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            const songs = await Song.find({ isDeleted: false });
            return songs.map(formatSong);
        },

        song: async (_: any, { id }: { id: string }, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            const song = await Song.findOne({ _id: id, isDeleted: false });

            if (!song) {
                throw new GraphQLError('Song not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            return formatSong(song);
        },

        playlistSongs: async (_: any, { playlistId }: { playlistId: string }, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            // Check access to playlist
            await checkPlaylistAccess(playlistId, context.user.id);

            const playlistSongs = await PlaylistSong.find({
                playlistId,
                isDeleted: false
            }).sort({ order: 1 });

            return playlistSongs.map(formatPlaylistSong);
        },
    },

    Mutation: {
        // User mutations
        register: async (_: any, { input }: { input: RegisterInput }) => {
            validateRegisterInput(input);

            const existingUser = await User.findOne({
                $or: [{ email: input.email }, { username: input.username }],
            });

            if (existingUser) {
                throw new GraphQLError('User already exists', {
                    extensions: {
                        code: 'USER_EXISTS',
                        field: existingUser.email === input.email ? 'email' : 'username',
                    },
                });
            }

            const hashedPassword = await bcrypt.hash(input.password, 12);

            const newUser = new User({
                username: input.username,
                email: input.email,
                password: hashedPassword,
                firstName: input.firstName,
                lastName: input.lastName,
            });

            const savedUser = await newUser.save();
            const token = generateToken(savedUser);

            pubsub.publish(USER_CREATED, {
                userCreated: formatUser(savedUser),
            });

            return {
                user: formatUser(savedUser),
                token,
            };
        },

        login: async (_: any, { input }: { input: LoginInput }) => {
            if (!input.email || !input.password) {
                throw new GraphQLError('Email and password are required', {
                    extensions: { code: 'VALIDATION_ERROR' },
                });
            }

            const user = await User.findOne({
                email: input.email,
                isDeleted: false
            });

            if (!user) {
                throw new GraphQLError('Invalid credentials', {
                    extensions: { code: 'INVALID_CREDENTIALS' },
                });
            }

            const isPasswordValid = await bcrypt.compare(
                input.password,
                user.password
            );

            if (!isPasswordValid) {
                throw new GraphQLError('Invalid credentials', {
                    extensions: { code: 'INVALID_CREDENTIALS' },
                });
            }

            const token = generateToken(user);

            return {
                user: formatUser(user),
                token,
            };
        },

        updateUser: async (
            _: any,
            { id, firstName, lastName }: { id: string; firstName?: string; lastName?: string },
            context: Context
        ) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            if (context.user.id !== id) {
                throw new GraphQLError('Not authorized', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }

            const updateData: Partial<IUser> = {};
            if (firstName) updateData.firstName = firstName;
            if (lastName) updateData.lastName = lastName;

            const user = await User.findOneAndUpdate(
                { _id: id, isDeleted: false },
                updateData,
                { new: true }
            );

            if (!user) {
                throw new GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            return formatUser(user);
        },

        deleteUser: async (_: any, { id }: { id: string }, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            if (context.user.id !== id) {
                throw new GraphQLError('Not authorized', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }

            const user = await User.findByIdAndUpdate(
                id,
                { isDeleted: true },
                { new: true }
            );

            if (!user) {
                throw new GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            return true;
        },

        // Playlist mutations
        createPlaylist: async (_: any, { input }: { input: CreatePlaylistInput }, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            if (!input.title || input.title.trim().length === 0) {
                throw new GraphQLError('Title is required', {
                    extensions: { code: 'VALIDATION_ERROR' },
                });
            }

            const newPlaylist = new Playlist({
                title: input.title,
                description: input.description || '',
                ownerId: context.user.id,
                isPublic: input.isPublic !== undefined ? input.isPublic : true,
            });

            const savedPlaylist = await newPlaylist.save();
            return formatPlaylist(savedPlaylist);
        },

        updatePlaylist: async (
            _: any,
            { id, input }: { id: string; input: UpdatePlaylistInput },
            context: Context
        ) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            // Check if user has EDITOR or ADMIN role
            await checkPlaylistAccess(id, context.user.id, ContributorRole.EDITOR);

            const updateData: Partial<IPlaylist> = {};
            if (input.title !== undefined) updateData.title = input.title;
            if (input.description !== undefined) updateData.description = input.description;
            if (input.isPublic !== undefined) updateData.isPublic = input.isPublic;

            const playlist = await Playlist.findOneAndUpdate(
                { _id: id, isDeleted: false },
                updateData,
                { new: true }
            );

            if (!playlist) {
                throw new GraphQLError('Playlist not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            // Publish update
            pubsub.publish(PLAYLIST_UPDATED, {
                playlistUpdated: formatPlaylist(playlist),
                playlistId: id,
            });

            return formatPlaylist(playlist);
        },

        deletePlaylist: async (_: any, { id }: { id: string }, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            const { isOwner } = await checkPlaylistAccess(id, context.user.id);

            if (!isOwner) {
                throw new GraphQLError('Only owner can delete playlist', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }

            await Playlist.findByIdAndUpdate(id, { isDeleted: true });
            return true;
        },

        // Song mutations
        createSong: async (_: any, { input }: { input: CreateSongInput }, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            if (!input.title || !input.artist || !input.duration || !input.fileId) {
                throw new GraphQLError('All fields are required', {
                    extensions: { code: 'VALIDATION_ERROR' },
                });
            }

            const newSong = new Song({
                title: input.title,
                artist: input.artist,
                duration: input.duration,
                fileId: input.fileId,
                uploadedBy: context.user.id,
            });

            const savedSong = await newSong.save();
            return formatSong(savedSong);
        },

        addSongToPlaylist: async (
            _: any,
            { playlistId, songId }: { playlistId: string; songId: string },
            context: Context
        ) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            // Check if user has EDITOR role
            await checkPlaylistAccess(playlistId, context.user.id, ContributorRole.EDITOR);

            // Check if song exists
            const song = await Song.findOne({ _id: songId, isDeleted: false });
            if (!song) {
                throw new GraphQLError('Song not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            // Check if song already in playlist
            const existing = await PlaylistSong.findOne({
                playlistId,
                songId,
                isDeleted: false
            });

            if (existing) {
                throw new GraphQLError('Song already in playlist', {
                    extensions: { code: 'DUPLICATE' },
                });
            }

            // Get next order number
            const lastSong = await PlaylistSong.findOne({ playlistId, isDeleted: false })
                .sort({ order: -1 });
            const nextOrder = lastSong ? lastSong.order + 1 : 0;

            const newPlaylistSong = new PlaylistSong({
                playlistId,
                songId,
                addedBy: context.user.id,
                order: nextOrder,
            });

            const savedPlaylistSong = await newPlaylistSong.save();

            // Publish real-time update
            pubsub.publish(SONG_ADDED_TO_PLAYLIST, {
                songAddedToPlaylist: formatPlaylistSong(savedPlaylistSong),
                playlistId,
            });

            return formatPlaylistSong(savedPlaylistSong);
        },

        removeSongFromPlaylist: async (
            _: any,
            { playlistId, songId }: { playlistId: string; songId: string },
            context: Context
        ) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            // Check if user has EDITOR role
            await checkPlaylistAccess(playlistId, context.user.id, ContributorRole.EDITOR);

            const playlistSong = await PlaylistSong.findOneAndUpdate(
                { playlistId, songId, isDeleted: false },
                { isDeleted: true },
                { new: true }
            );

            if (!playlistSong) {
                throw new GraphQLError('Song not found in playlist', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            // Publish real-time update
            pubsub.publish(SONG_REMOVED_FROM_PLAYLIST, {
                songRemovedFromPlaylist: songId,
                playlistId,
            });

            return true;
        },

        reorderPlaylistSongs: async (
            _: any,
            { playlistId, songIds }: { playlistId: string; songIds: string[] },
            context: Context
        ) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            // Check if user has EDITOR role
            await checkPlaylistAccess(playlistId, context.user.id, ContributorRole.EDITOR);

            // Update order for each song
            const updates = songIds.map((songId, index) =>
                PlaylistSong.findOneAndUpdate(
                    { playlistId, songId, isDeleted: false },
                    { order: index },
                    { new: true }
                )
            );

            const updatedSongs = await Promise.all(updates);
            const validSongs = updatedSongs.filter((s) => s !== null);

            return validSongs.map((s) => formatPlaylistSong(s!));
        },

        // Contributor mutations
        addContributor: async (_: any, { input }: { input: AddContributorInput }, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            // Check if user has ADMIN role
            await checkPlaylistAccess(input.playlistId, context.user.id, ContributorRole.ADMIN);

            // Check if user exists
            const user = await User.findOne({ _id: input.userId, isDeleted: false });
            if (!user) {
                throw new GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            // Check if already contributor
            const existing = await Contributor.findOne({
                playlistId: input.playlistId,
                userId: input.userId,
                isDeleted: false
            });

            if (existing) {
                throw new GraphQLError('User is already a contributor', {
                    extensions: { code: 'DUPLICATE' },
                });
            }

            const newContributor = new Contributor({
                playlistId: input.playlistId,
                userId: input.userId,
                role: input.role,
                invitedBy: context.user.id,
            });

            const savedContributor = await newContributor.save();

            // Publish real-time update
            pubsub.publish(CONTRIBUTOR_ADDED, {
                contributorAdded: formatContributor(savedContributor),
                playlistId: input.playlistId,
            });

            return formatContributor(savedContributor);
        },

        removeContributor: async (
            _: any,
            { playlistId, userId }: { playlistId: string; userId: string },
            context: Context
        ) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            // Check if user has ADMIN role
            await checkPlaylistAccess(playlistId, context.user.id, ContributorRole.ADMIN);

            const contributor = await Contributor.findOneAndUpdate(
                { playlistId, userId, isDeleted: false },
                { isDeleted: true },
                { new: true }
            );

            if (!contributor) {
                throw new GraphQLError('Contributor not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            return true;
        },

        updateContributorRole: async (
            _: any,
            { playlistId, userId, role }: { playlistId: string; userId: string; role: ContributorRole },
            context: Context
        ) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            // Check if user has ADMIN role
            await checkPlaylistAccess(playlistId, context.user.id, ContributorRole.ADMIN);

            const contributor = await Contributor.findOneAndUpdate(
                { playlistId, userId, isDeleted: false },
                { role },
                { new: true }
            );

            if (!contributor) {
                throw new GraphQLError('Contributor not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            return formatContributor(contributor);
        },
    },

    Subscription: {
        serverTime: {
            subscribe: async function* () {
                while (true) {
                    yield { serverTime: new Date().toISOString() };
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            },
        },
        userCreated: {
            subscribe: () => pubsub.asyncIterator([USER_CREATED]),
        },
        playlistUpdated: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([PLAYLIST_UPDATED]),
                async (payload: any, variables: { playlistId: string }, context: Context) => {
                    if (payload.playlistId !== variables.playlistId) return false;
                    if (!context?.user?.id) return false;

                    try {
                        await checkPlaylistAccess(variables.playlistId, context.user.id);
                        return true;
                    } catch {
                        return false;
                    }
                }
            ),
        },
        songAddedToPlaylist: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([SONG_ADDED_TO_PLAYLIST]),
                async (payload: any, variables: { playlistId: string }, context: Context) => {
                    if (payload.playlistId !== variables.playlistId) return false;
                    if (!context?.user?.id) return false;

                    try {
                        await checkPlaylistAccess(variables.playlistId, context.user.id);
                        return true;
                    } catch {
                        return false;
                    }
                }
            ),
        },
        songRemovedFromPlaylist: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([SONG_REMOVED_FROM_PLAYLIST]),
                async (payload: any, variables: { playlistId: string }, context: Context) => {
                    if (payload.playlistId !== variables.playlistId) return false;
                    if (!context?.user?.id) return false;

                    try {
                        await checkPlaylistAccess(variables.playlistId, context.user.id);
                        return true;
                    } catch {
                        return false;
                    }
                }
            ),
        },
        contributorAdded: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([CONTRIBUTOR_ADDED]),
                async (payload: any, variables: { playlistId: string }, context: Context) => {
                    if (payload.playlistId !== variables.playlistId) return false;
                    if (!context?.user?.id) return false;

                    try {
                        await checkPlaylistAccess(variables.playlistId, context.user.id, ContributorRole.VIEWER);
                        return true;
                    } catch {
                        return false;
                    }
                }
            ),
        },
    },

    // Field resolvers for nested data
    Playlist: {
        owner: async (parent: any) => {
            const user = await User.findById(parent.ownerId);
            return user ? formatUser(user) : null;
        },
        songs: async (parent: any) => {
            const playlistSongs = await PlaylistSong.find({
                playlistId: parent.id,
                isDeleted: false
            }).sort({ order: 1 });
            return playlistSongs.map(formatPlaylistSong);
        },
        contributors: async (parent: any) => {
            const contributors = await Contributor.find({
                playlistId: parent.id,
                isDeleted: false
            });
            return contributors.map(formatContributor);
        },
    },

    Song: {
        uploadedBy: async (parent: any) => {
            const user = await User.findById(parent.uploadedById);
            return user ? formatUser(user) : null;
        },
    },

    PlaylistSong: {
        playlist: async (parent: any) => {
            const playlist = await Playlist.findById(parent.playlistId);
            return playlist ? formatPlaylist(playlist) : null;
        },
        song: async (parent: any) => {
            const song = await Song.findById(parent.songId);
            return song ? formatSong(song) : null;
        },
        addedBy: async (parent: any) => {
            const user = await User.findById(parent.addedById);
            return user ? formatUser(user) : null;
        },
    },

    Contributor: {
        playlist: async (parent: any) => {
            const playlist = await Playlist.findById(parent.playlistId);
            return playlist ? formatPlaylist(playlist) : null;
        },
        user: async (parent: any) => {
            const user = await User.findById(parent.userId);
            return user ? formatUser(user) : null;
        },
        invitedBy: async (parent: any) => {
            const user = await User.findById(parent.invitedById);
            return user ? formatUser(user) : null;
        },
    },
};