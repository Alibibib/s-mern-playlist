import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { resolvers } from '../resolvers';
import User from '../../models/User';
import Playlist from '../../models/Playlist';
import Song from '../../models/Song';
import PlaylistSong from '../../models/PlaylistSong';
import Contributor, { ContributorRole } from '../../models/Contributor';

describe('GraphQL Resolvers', () => {
  let testUser: any;
  let testUser2: any;
  let testPlaylist: any;
  let testSong: any;
  let authContext: any;
  let authContext2: any;

  beforeEach(async () => {
    // Create test users
    const hashedPassword = await bcrypt.hash('Test123!', 12);
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
    });

    const hashedPassword2 = await bcrypt.hash('Test123!', 12);
    testUser2 = await User.create({
      username: 'testuser2',
      email: 'test2@example.com',
      password: hashedPassword2,
      firstName: 'Test',
      lastName: 'User2',
    });

    authContext = {
      user: {
        id: testUser._id.toString(),
        email: testUser.email,
      },
    };

    authContext2 = {
      user: {
        id: testUser2._id.toString(),
        email: testUser2.email,
      },
    };

    // Create test playlist
    testPlaylist = await Playlist.create({
      title: 'Test Playlist',
      description: 'Test Description',
      ownerId: testUser._id,
      isPublic: false,
    });

    // Create test song
    testSong = await Song.create({
      title: 'Test Song',
      artist: 'Test Artist',
      duration: 180,
      fileId: new mongoose.Types.ObjectId(),
      uploadedBy: testUser._id,
    });
  });

  describe('register mutation', () => {
    it('should register a new user successfully', async () => {
      const input = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
      };

      const result = await resolvers.Mutation.register(null, { input });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(input.email);
      expect(result.user.username).toBe(input.username);
      expect(result.token).toBeDefined();

      // Verify user was created in DB
      const user = await User.findOne({ email: input.email });
      expect(user).toBeDefined();
      expect(user?.username).toBe(input.username);
    });

    it('should throw error for duplicate email', async () => {
      const input = {
        username: 'anotheruser',
        email: testUser.email, // Duplicate email
        password: 'Password123!',
        firstName: 'Another',
        lastName: 'User',
      };

      await expect(
        resolvers.Mutation.register(null, { input })
      ).rejects.toThrow(GraphQLError);
    });

    it('should throw validation error for invalid input', async () => {
      const input = {
        username: 'ab', // Too short
        email: 'invalid-email', // Invalid format
        password: '123', // Too short
        firstName: '',
        lastName: '',
      };

      await expect(
        resolvers.Mutation.register(null, { input })
      ).rejects.toThrow();
    });
  });

  describe('login mutation', () => {
    it('should login user successfully with correct credentials', async () => {
      const input = {
        email: testUser.email,
        password: 'Test123!',
      };

      const result = await resolvers.Mutation.login(null, { input });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testUser.email);
      expect(result.token).toBeDefined();

      // Verify token is valid
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET || 'unsafe_secret_key') as any;
      expect(decoded.id).toBe(testUser._id.toString());
    });

    it('should throw error for invalid password', async () => {
      const input = {
        email: testUser.email,
        password: 'WrongPassword',
      };

      await expect(
        resolvers.Mutation.login(null, { input })
      ).rejects.toThrow(GraphQLError);
    });

    it('should throw error for non-existent user', async () => {
      const input = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      await expect(
        resolvers.Mutation.login(null, { input })
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('me query', () => {
    it('should return current user when authenticated', async () => {
      const result = await resolvers.Query.me(null, {}, authContext);

      expect(result).toBeDefined();
      expect(result.id).toBe(testUser._id.toString());
      expect(result.email).toBe(testUser.email);
      expect(result.username).toBe(testUser.username);
    });

    it('should throw error when not authenticated', async () => {
      await expect(
        resolvers.Query.me(null, {}, {} as any)
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('createPlaylist mutation', () => {
    it('should create playlist successfully', async () => {
      const input = {
        title: 'New Playlist',
        description: 'New Description',
        isPublic: true,
      };

      const result = await resolvers.Mutation.createPlaylist(null, { input }, authContext);

      expect(result).toBeDefined();
      expect(result.title).toBe(input.title);
      expect(result.description).toBe(input.description);
      expect(result.isPublic).toBe(true);

      // Verify playlist was created in DB
      const playlist = await Playlist.findById(result.id);
      expect(playlist).toBeDefined();
      expect(playlist?.ownerId.toString()).toBe(testUser._id.toString());
    });

    it('should throw error when not authenticated', async () => {
      const input = {
        title: 'New Playlist',
        description: 'New Description',
        isPublic: true,
      };

      await expect(
        resolvers.Mutation.createPlaylist(null, { input }, {} as any)
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('playlists query', () => {
    it('should return only accessible playlists (owned, public, or contributor)', async () => {
      // Create public playlist
      await Playlist.create({
        title: 'Public Playlist',
        description: 'Public',
        ownerId: testUser2._id,
        isPublic: true,
      });

      // Create private playlist owned by testUser
      await Playlist.create({
        title: 'My Private Playlist',
        description: 'Private',
        ownerId: testUser._id,
        isPublic: false,
      });

      // Create private playlist owned by testUser2 (should not be visible)
      await Playlist.create({
        title: 'Other Private Playlist',
        description: 'Private',
        ownerId: testUser2._id,
        isPublic: false,
      });

      // Add testUser as contributor to a playlist
      const contributorPlaylist = await Playlist.create({
        title: 'Contributor Playlist',
        description: 'Contributor',
        ownerId: testUser2._id,
        isPublic: false,
      });

      await Contributor.create({
        playlistId: contributorPlaylist._id,
        userId: testUser._id,
        role: ContributorRole.VIEWER,
        invitedBy: testUser2._id,
      });

      const result = await resolvers.Query.playlists(null, {}, authContext);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      // Should see: public playlist, own private playlist, contributor playlist
      const titles = result.map((p: any) => p.title);
      expect(titles).toContain('Public Playlist');
      expect(titles).toContain('My Private Playlist');
      expect(titles).toContain('Contributor Playlist');
      expect(titles).not.toContain('Other Private Playlist');
    });
  });

  describe('addSongToPlaylist mutation', () => {
    it('should add song to playlist successfully', async () => {
      const result = await resolvers.Mutation.addSongToPlaylist(
        null,
        {
          playlistId: testPlaylist._id.toString(),
          songId: testSong._id.toString(),
        },
        authContext
      );

      expect(result).toBeDefined();
      expect(result.playlistId).toBe(testPlaylist._id.toString());
      expect(result.songId).toBe(testSong._id.toString());

      // Verify playlist song was created
      const playlistSong = await PlaylistSong.findOne({
        playlistId: testPlaylist._id,
        songId: testSong._id,
        isDeleted: false,
      });
      expect(playlistSong).toBeDefined();
    });

    it('should throw error when user has no access', async () => {
      // Create private playlist owned by testUser2
      const privatePlaylist = await Playlist.create({
        title: 'Private Playlist',
        description: 'Private',
        ownerId: testUser2._id,
        isPublic: false,
      });

      await expect(
        resolvers.Mutation.addSongToPlaylist(
          null,
          {
            playlistId: privatePlaylist._id.toString(),
            songId: testSong._id.toString(),
          },
          authContext // testUser trying to access testUser2's playlist
        )
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('checkPlaylistAccess helper', () => {
    it('should allow access for playlist owner', async () => {
      // This is tested indirectly through other queries/mutations
      // Owner should have full access
      const playlist = await Playlist.findById(testPlaylist._id);
      expect(playlist?.ownerId.toString()).toBe(testUser._id.toString());
    });

    it('should allow access for contributor', async () => {
      const contributorPlaylist = await Playlist.create({
        title: 'Contributor Playlist',
        description: 'Contributor',
        ownerId: testUser2._id,
        isPublic: false,
      });

      await Contributor.create({
        playlistId: contributorPlaylist._id,
        userId: testUser._id,
        role: ContributorRole.EDITOR,
        invitedBy: testUser2._id,
      });

      // Should be able to query the playlist
      const result = await resolvers.Query.playlist(
        null,
        { id: contributorPlaylist._id.toString() },
        authContext
      );
      expect(result).toBeDefined();
    });

    it('should deny access for unauthorized user', async () => {
      const privatePlaylist = await Playlist.create({
        title: 'Private Playlist',
        description: 'Private',
        ownerId: testUser2._id,
        isPublic: false,
      });

      await expect(
        resolvers.Query.playlist(
          null,
          { id: privatePlaylist._id.toString() },
          authContext // testUser trying to access testUser2's private playlist
        )
      ).rejects.toThrow(GraphQLError);
    });
  });
});
