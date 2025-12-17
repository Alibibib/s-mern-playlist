const fetch = require('node-fetch');
const fs = require('fs');
const crypto = require('crypto');

const env = JSON.parse(fs.readFileSync('test-env.json'));
const { TOKEN, PLAYLIST_ID } = env;

const randomHex = (len) => crypto.randomBytes(len).toString('hex').slice(0, len);
const randomObjectId = () => randomHex(24);

async function main() {
    console.log('Creating new song...');
    const createSongQuery = `
      mutation CreateSong($input: CreateSongInput!) {
        createSong(input: $input) {
          id
          title
        }
      }
    `;

    const songInput = {
        title: `Test Song ${Date.now()}`,
        artist: 'Test Artist',
        duration: 120,
        fileId: randomObjectId()
    };

    const createRes = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
            query: createSongQuery,
            variables: { input: songInput }
        })
    });

    const createJson = await createRes.json();
    if (createJson.errors) throw new Error(JSON.stringify(createJson.errors));

    const newSongId = createJson.data.createSong.id;
    console.log('✅ Created Song:', newSongId);

    console.log('Adding song to playlist...');
    const addQuery = `
      mutation AddSong($playlistId: ID!, $songId: ID!) {
        addSongToPlaylist(playlistId: $playlistId, songId: $songId) {
          id
          song { title }
        }
      }
    `;

    const addRes = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
            query: addQuery,
            variables: { playlistId: PLAYLIST_ID, songId: newSongId }
        })
    });

    const addJson = await addRes.json();
    console.log('Mutation Result:', JSON.stringify(addJson, null, 2));
}

main().catch(console.error);
