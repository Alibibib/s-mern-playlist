import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';
import Playlist from '../models/Playlist';
import Song from '../models/Song';
import PlaylistSong from '../models/PlaylistSong';
import Contributor, { ContributorRole } from '../models/Contributor';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://root:password@localhost:27017/mern-db?authSource=admin&directConnection=true';

const seed = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Playlist.deleteMany({});
    await Song.deleteMany({});
    await PlaylistSong.deleteMany({});
    await Contributor.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create test users
    console.log('👥 Creating test users...');
    const hashedPassword = await bcrypt.hash('password123', 12);

    const users = await User.insertMany([
      {
        username: 'alice',
        email: 'alice@example.com',
        password: hashedPassword,
        firstName: 'Alice',
        lastName: 'Smith',
      },
      {
        username: 'bob',
        email: 'bob@example.com',
        password: hashedPassword,
        firstName: 'Bob',
        lastName: 'Johnson',
      },
      {
        username: 'charlie',
        email: 'charlie@example.com',
        password: hashedPassword,
        firstName: 'Charlie',
        lastName: 'Brown',
      },
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create test songs
    console.log('🎵 Creating test songs...');
    const songs = await Song.insertMany([
      {
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        duration: 355,
        fileId: new mongoose.Types.ObjectId(),
        uploadedBy: users[0]._id,
      },
      {
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        duration: 482,
        fileId: new mongoose.Types.ObjectId(),
        uploadedBy: users[0]._id,
      },
      {
        title: 'Hotel California',
        artist: 'Eagles',
        duration: 391,
        fileId: new mongoose.Types.ObjectId(),
        uploadedBy: users[1]._id,
      },
      {
        title: 'Sweet Child O Mine',
        artist: "Guns N' Roses",
        duration: 356,
        fileId: new mongoose.Types.ObjectId(),
        uploadedBy: users[1]._id,
      },
      {
        title: 'Imagine',
        artist: 'John Lennon',
        duration: 183,
        fileId: new mongoose.Types.ObjectId(),
        uploadedBy: users[2]._id,
      },
      {
        title: 'Billie Jean',
        artist: 'Michael Jackson',
        duration: 294,
        fileId: new mongoose.Types.ObjectId(),
        uploadedBy: users[2]._id,
      },
      {
        title: 'Like a Rolling Stone',
        artist: 'Bob Dylan',
        duration: 366,
        fileId: new mongoose.Types.ObjectId(),
        uploadedBy: users[0]._id,
      },
      {
        title: 'Smells Like Teen Spirit',
        artist: 'Nirvana',
        duration: 301,
        fileId: new mongoose.Types.ObjectId(),
        uploadedBy: users[1]._id,
      },
    ]);

    console.log(`✅ Created ${songs.length} songs`);

    // Create test playlists
    console.log('📝 Creating test playlists...');
    const playlists = await Playlist.insertMany([
      {
        title: 'Classic Rock Hits',
        description: 'The best classic rock songs',
        ownerId: users[0]._id,
        isPublic: true,
      },
      {
        title: 'My Private Collection',
        description: 'Personal favorites',
        ownerId: users[0]._id,
        isPublic: false,
      },
      {
        title: '80s Pop Anthems',
        description: 'Best songs from the 80s',
        ownerId: users[1]._id,
        isPublic: true,
      },
      {
        title: 'Chill Vibes',
        description: 'Relaxing music',
        ownerId: users[2]._id,
        isPublic: true,
      },
      {
        title: 'Workout Mix',
        description: 'High energy songs for workouts',
        ownerId: users[1]._id,
        isPublic: false,
      },
    ]);

    console.log(`✅ Created ${playlists.length} playlists`);

    // Add songs to playlists
    console.log('🎧 Adding songs to playlists...');
    const playlistSongs = [];

    // Classic Rock Hits (public) - songs 0, 1, 2
    playlistSongs.push(
      {
        playlistId: playlists[0]._id,
        songId: songs[0]._id,
        addedBy: users[0]._id,
        order: 0,
      },
      {
        playlistId: playlists[0]._id,
        songId: songs[1]._id,
        addedBy: users[0]._id,
        order: 1,
      },
      {
        playlistId: playlists[0]._id,
        songId: songs[2]._id,
        addedBy: users[0]._id,
        order: 2,
      }
    );

    // My Private Collection - songs 3, 4
    playlistSongs.push(
      {
        playlistId: playlists[1]._id,
        songId: songs[3]._id,
        addedBy: users[0]._id,
        order: 0,
      },
      {
        playlistId: playlists[1]._id,
        songId: songs[4]._id,
        addedBy: users[0]._id,
        order: 1,
      }
    );

    // 80s Pop Anthems - songs 5, 6
    playlistSongs.push(
      {
        playlistId: playlists[2]._id,
        songId: songs[5]._id,
        addedBy: users[1]._id,
        order: 0,
      },
      {
        playlistId: playlists[2]._id,
        songId: songs[6]._id,
        addedBy: users[1]._id,
        order: 1,
      }
    );

    // Chill Vibes - songs 4, 7
    playlistSongs.push(
      {
        playlistId: playlists[3]._id,
        songId: songs[4]._id,
        addedBy: users[2]._id,
        order: 0,
      },
      {
        playlistId: playlists[3]._id,
        songId: songs[7]._id,
        addedBy: users[2]._id,
        order: 1,
      }
    );

    // Workout Mix - songs 0, 3, 7
    playlistSongs.push(
      {
        playlistId: playlists[4]._id,
        songId: songs[0]._id,
        addedBy: users[1]._id,
        order: 0,
      },
      {
        playlistId: playlists[4]._id,
        songId: songs[3]._id,
        addedBy: users[1]._id,
        order: 1,
      },
      {
        playlistId: playlists[4]._id,
        songId: songs[7]._id,
        addedBy: users[1]._id,
        order: 2,
      }
    );

    await PlaylistSong.insertMany(playlistSongs);
    console.log(`✅ Added ${playlistSongs.length} songs to playlists`);

    // Add contributors
    console.log('👥 Adding contributors...');
    const contributors = await Contributor.insertMany([
      {
        playlistId: playlists[0]._id, // Classic Rock Hits
        userId: users[1]._id,
        role: ContributorRole.EDITOR,
        invitedBy: users[0]._id,
      },
      {
        playlistId: playlists[0]._id, // Classic Rock Hits
        userId: users[2]._id,
        role: ContributorRole.VIEWER,
        invitedBy: users[0]._id,
      },
      {
        playlistId: playlists[2]._id, // 80s Pop Anthems
        userId: users[0]._id,
        role: ContributorRole.ADMIN,
        invitedBy: users[1]._id,
      },
    ]);

    console.log(`✅ Added ${contributors.length} contributors`);

    console.log('\n📊 Seed Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Songs: ${songs.length}`);
    console.log(`   Playlists: ${playlists.length}`);
    console.log(`   Playlist Songs: ${playlistSongs.length}`);
    console.log(`   Contributors: ${contributors.length}`);

    console.log('\n🔑 Test User Credentials:');
    console.log('   Email: alice@example.com | Password: password123');
    console.log('   Email: bob@example.com | Password: password123');
    console.log('   Email: charlie@example.com | Password: password123');

    console.log('\n✅ Database seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seed();
