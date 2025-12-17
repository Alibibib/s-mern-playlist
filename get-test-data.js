const fetch = require('node-fetch');
const fs = require('fs');

async function main() {
    const loginQuery = `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        token
        user { id email }
      }
    }
  `;

    const dataQuery = `
    query GetData {
      playlists { id title }
      songs { id title }
    }
  `;

    // 1. Login
    const loginRes = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: loginQuery,
            variables: { input: { email: 'alice@example.com', password: 'password123' } }
        })
    });

    const loginJson = await loginRes.json();
    if (loginJson.errors) throw new Error(JSON.stringify(loginJson.errors));

    const token = loginJson.data.login.token;

    // 2. Get Data
    const dataRes = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: dataQuery })
    });

    const dataJson = await dataRes.json();
    if (dataJson.errors) throw new Error(JSON.stringify(dataJson.errors));

    const playlist = dataJson.data.playlists[0];
    const song = dataJson.data.songs[0];

    const env = {
        TOKEN: token,
        PLAYLIST_ID: playlist.id,
        SONG_ID: song.id
    };

    fs.writeFileSync('test-env.json', JSON.stringify(env, null, 2));
    console.log('✅ Saved test-env.json');
}

main().catch(console.error);
