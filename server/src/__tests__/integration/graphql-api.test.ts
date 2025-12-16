import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { resolvers } from '@graphql/resolvers';
import User from '../../models/User';
import Playlist from '../../models/Playlist';
import PlaylistSong from '../../models/PlaylistSong';
import Contributor, { ContributorRole } from '../../models/Contributor';

describe('GraphQL API Integration Test', () => {
  let user1: any;
  let user2: any;
  let authContext1: any;
  let authContext2: any;
  let playlist: any;
  let song1: any;
  let song2: any;

  beforeEach(async () => {
    // Create two test users
    const hashedPassword1 = await bcrypt.hash('Password123!', 12);
    user1 = await User.create({
      username: 'user1',
      email: 'user1@example.com',
      password: hashedPassword1,
      firstName: 'User',
      lastName: 'One',
    });

    const hashedPassword2 = await bcrypt.hash('Password123!', 12);
    user2 = await User.create({
      username: 'user2',
      email: 'user2@example.com',
      password: hashedPassword2,
      firstName: 'User',
      lastName: 'Two',
    });

    authContext1 = {
      user: {
        id: user1._id.toString(),
        email: user1.email,
      },
    };

    authContext2 = {
      user: {
        id: user2._id.toString(),
        email: user2.email,
      },
    };
  });

  it('should complete full flow: register → login → create playlist → add songs → add contributor', async () => {
    // Step 1: Register a new user
    const registerInput = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'Password123!',
      firstName: 'New',
      lastName: 'User',
    };

    const registerResult = await resolvers.Mutation.register(null, { input: registerInput });
    expect(registerResult.user).toBeDefined();
    expect(registerResult.token).toBeDefined();

    const newUser = await User.findOne({ email: registerInput.email });
    expect(newUser).toBeDefined();

    const newAuthContext = {
      user: {
        id: newUser!._id.toString(),
        email: newUser!.email,
      },
    };

    // Step 2: Login with the new user
    const loginResult = await resolvers.Mutation.login(
      null,
      { input: { email: registerInput.email, password: registerInput.password } }
    );
    expect(loginResult.user.email).toBe(registerInput.email);
    expect(loginResult.token).toBeDefined();

    // Step 3: Create a playlist
    const playlistInput = {
      title: 'My Test Playlist',
      description: 'Integration test playlist',
      isPublic: false,
    };

    const playlistResult = await resolvers.Mutation.createPlaylist(
      null,
      { input: playlistInput },
      newAuthContext
    );
    expect(playlistResult.title).toBe(playlistInput.title);
    expect(playlistResult.isPublic).toBe(false);

    const createdPlaylist = await Playlist.findById(playlistResult.id);
    expect(createdPlaylist).toBeDefined();
    expect(createdPlaylist?.ownerId.toString()).toBe(newUser!._id.toString());

    // Step 4: Create songs
    const song1Input = {
      title: 'Song 1',
      artist: 'Artist 1',
      duration: 180,
      fileId: new mongoose.Types.ObjectId().toString(),
    };

    const song2Input = {
      title: 'Song 2',
      artist: 'Artist 2',
      duration: 240,
      fileId: new mongoose.Types.ObjectId().toString(),
    };

    const song1Result = await resolvers.Mutation.createSong(null, { input: song1Input }, newAuthContext);
    const song2Result = await resolvers.Mutation.createSong(null, { input: song2Input }, newAuthContext);

    expect(song1Result.title).toBe(song1Input.title);
    expect(song2Result.title).toBe(song2Input.title);

    // Step 5: Add songs to playlist
    const addSong1Result = await resolvers.Mutation.addSongToPlaylist(
      null,
      {
        playlistId: playlistResult.id,
        songId: song1Result.id,
      },
      newAuthContext
    );
    expect(addSong1Result).toBeDefined();

    const addSong2Result = await resolvers.Mutation.addSongToPlaylist(
      null,
      {
        playlistId: playlistResult.id,
        songId: song2Result.id,
      },
      newAuthContext
    );
    expect(addSong2Result).toBeDefined();

    // Verify songs were added
    const playlistSongs = await PlaylistSong.find({
      playlistId: playlistResult.id,
      isDeleted: false,
    });
    expect(playlistSongs.length).toBe(2);

    // Step 6: Add contributor
    const contributorInput = {
      playlistId: playlistResult.id,
      userId: user1._id.toString(),
      role: ContributorRole.EDITOR,
    };

    const contributorResult = await resolvers.Mutation.addContributor(
      null,
      { input: contributorInput },
      newAuthContext
    );
    expect(contributorResult).toBeDefined();
    expect(contributorResult.role).toBe(ContributorRole.EDITOR);

    // Verify contributor was added
    const contributor = await Contributor.findOne({
      playlistId: playlistResult.id,
      userId: user1._id,
      isDeleted: false,
    });
    expect(contributor).toBeDefined();

    // Step 7: Verify contributor can access playlist
    const contributorAuthContext = {
      user: {
        id: user1._id.toString(),
        email: user1.email,
      },
    };

    const playlistQueryResult = await resolvers.Query.playlist(
      null,
      { id: playlistResult.id },
      contributorAuthContext
    );
    expect(playlistQueryResult).toBeDefined();
    expect(playlistQueryResult.id).toBe(playlistResult.id);

    // Step 8: Contributor can add song (EDITOR role)
    const song3Input = {
      title: 'Song 3',
      artist: 'Artist 3',
      duration: 200,
      fileId: new mongoose.Types.ObjectId().toString(),
    };

    const song3Result = await resolvers.Mutation.createSong(null, { input: song3Input }, contributorAuthContext);

    const addSong3Result = await resolvers.Mutation.addSongToPlaylist(
      null,
      {
        playlistId: playlistResult.id,
        songId: song3Result.id,
      },
      contributorAuthContext
    );
    expect(addSong3Result).toBeDefined();

    // Verify all 3 songs are in playlist
    const finalPlaylistSongs = await PlaylistSong.find({
      playlistId: playlistResult.id,
      isDeleted: false,
    });
    expect(finalPlaylistSongs.length).toBe(3);
  });

  it('should handle playlist access control correctly', async () => {
    // Create private playlist owned by user1
    const privatePlaylist = await Playlist.create({
      title: 'Private Playlist',
      description: 'Private',
      ownerId: user1._id,
      isPublic: false,
    });

    // user1 should access their own playlist
    const user1Result = await resolvers.Query.playlist(
      null,
      { id: privatePlaylist._id.toString() },
      authContext1
    );
    expect(user1Result).toBeDefined();

    // user2 should NOT access user1's private playlist
    await expect(
      resolvers.Query.playlist(null, { id: privatePlaylist._id.toString() }, authContext2)
    ).rejects.toThrow();

    // Add user2 as contributor
    await Contributor.create({
      playlistId: privatePlaylist._id,
      userId: user2._id,
      role: ContributorRole.VIEWER,
      invitedBy: user1._id,
    });

    // Now user2 should access the playlist
    const user2Result = await resolvers.Query.playlist(
      null,
      { id: privatePlaylist._id.toString() },
      authContext2
    );
    expect(user2Result).toBeDefined();
  });
});
