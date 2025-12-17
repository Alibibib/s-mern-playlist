# =========================
# AUTH
# =========================

mutation Register {
register(input: {
username: "Frontbek"
email: "frontbek@gmail.com"
password: "Frontbek123"
firstName: "Frontbek"
lastName: "Frontbek"
}) {
token
user {
id
username
email
firstName
lastName
createdAt
}
}
}

mutation Login {
login(input: {
email: "frontbek@gmail.com"
password: "Frontbek123"
}) {
token
user {
id
username
email
firstName
lastName
}
}
}

query Me {
me {
id
username
email
firstName
lastName
createdAt
}
}

query GetUsers {
users {
id
username
email
firstName
lastName
}
}

query GetUser {
user(id: "USER_ID") {
id
username
email
firstName
lastName
createdAt
}
}

# =========================
# PLAYLISTS
# =========================

mutation CreatePlaylist {
createPlaylist(input: {
title: "Hip Hop"
description: "Rap songs"
isPublic: true
}) {
id
title
description
isPublic
owner {
id
username
firstName
lastName
}
createdAt
updatedAt
}
}

query GetAllPlaylists {
playlists {
id
title
description
isPublic
owner {
id
username
}
createdAt
}
}

query GetPublicPlaylists {
publicPlaylists {
id
title
description
owner {
username
}
createdAt
}
}

query GetPlaylist {
playlist(id: "693ebc29f265d890ee4eda31") {
id
title
description
isPublic
owner {
id
username
firstName
lastName
}
songs {
id
order
song {
id
title
artist
duration
}
addedBy {
username
}
createdAt
}
contributors {
id
role
user {
id
username
}
invitedBy {
username
}
}
createdAt
updatedAt
}
}

query MyPlaylists {
myPlaylists {
id
title
description
isPublic
createdAt
updatedAt
}
}

mutation UpdatePlaylist {
updatePlaylist(
id: "693ebc29f265d890ee4eda31"
input: {
title: "Queen"
description: "My favourite Queen songs"
isPublic: true
}
) {
id
title
description
isPublic
updatedAt
}
}

# =========================
# SONGS
# =========================

mutation CreateSong {
createSong(input: {
title: "Bohemian Rhapsody"
artist: "Queen"
duration: 354
fileId: "693ec69ceae8eb8e5a4623a6"
}) {
id
title
artist
duration
fileId
uploadedBy {
id
username
firstName
lastName
}
createdAt
updatedAt
}
}

mutation AddSongToPlaylist {
addSongToPlaylist(
playlistId: "693ec99747fa0af1e34e9b03"
songId: "693ec735eae8eb8e5a4623de"
) {
id
order
playlist {
id
title
}
song {
id
title
artist
duration
fileId
}
addedBy {
id
username
}
createdAt
}
}

query GetAllSongs {
songs {
id
title
artist
duration
fileId
uploadedBy {
username
}
createdAt
}
}

query GetSong {
song(id: "SONG_ID") {
id
title
artist
duration
fileId
uploadedBy {
username
}
}
}

query GetPlaylistSongs {
playlistSongs(playlistId: "PLAYLIST_ID") {
id
order
song {
id
title
artist
duration
}
addedBy {
username
}
createdAt
}
}

# =========================
# PLAYLISTS WITH SONGS
# =========================

query GetAllPlaylistsWithSongs {
playlists {
id
title
description
isPublic
owner {
username
}
songs {
id
order
song {
id
title
artist
duration
fileId
}
addedBy {
username
}
}
}
}

query GetPlaylistWithSongs {
playlist(id: "693ec99747fa0af1e34e9b03") {
id
title
description
owner {
id
username
}
contributors {
user {
username
}
role
}
songs {
id
order
createdAt
song {
id
title
artist
duration
fileId
uploadedBy {
username
}
}
}
}
}

# =========================
# SUBSCRIPTIONS
# =========================

subscription ServerTime {
serverTime
}

subscription OnUserCreated {
userCreated {
id
username
email
}
}

subscription OnPlaylistUpdated {
playlistUpdated(playlistId: "PLAYLIST_ID") {
id
title
description
updatedAt
}
}

subscription OnSongAddedToPlaylist {
songAddedToPlaylist(playlistId: "PLAYLIST_ID") {
id
song {
title
artist
}
addedBy {
username
}
}
}

subscription OnSongRemovedFromPlaylist {
songRemovedFromPlaylist(playlistId: "PLAYLIST_ID")
}

subscription OnContributorAdded {
contributorAdded(playlistId: "PLAYLIST_ID") {
id
user {
username
}
role
}
}
