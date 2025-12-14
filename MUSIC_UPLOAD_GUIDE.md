# 🎵 Music Upload & Playlist Management Guide

## 📋 Полный Workflow для работы с музыкой

### Шаг 1: Регистрация/Вход

Сначала зарегистрируйтесь или войдите через GraphQL:

```graphql
mutation Register {
  register(input: {
    username: "Sayat"
    email: "sayat@gmail.com"
    password: "Sayat123"  # Минимум 6 символов!
    firstName: "Sayat"
    lastName: "Sayat"
  }) {
    token
    user {
      id
      username
      email
    }
  }
}
```

**📝 Сохраните token из ответа!** Он понадобится для загрузки файлов.

---

### Шаг 2: Загрузка музыкального файла

#### Вариант A: Через HTML интерфейс (Рекомендуется)

1. Откройте файл `upload-music.html` в браузере
2. Вставьте ваш JWT token
3. Заполните информацию о песне:
   - Название
   - Исполнитель
   - Длительность (в секундах)
4. Выберите аудиофайл (MP3, WAV, OGG, FLAC)
5. Нажмите "Upload Music"
6. **Скопируйте полученный fileId!**

#### Вариант B: Через cURL

```bash
curl -X POST http://localhost:4000/api/upload/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "audio=@/path/to/your/song.mp3" \
  -F "title=Bohemian Rhapsody" \
  -F "artist=Queen" \
  -F "duration=354"
```

#### Вариант C: Через Postman/Insomnia

1. **Method:** POST
2. **URL:** `http://localhost:4000/api/upload/upload`
3. **Headers:**
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```
4. **Body (form-data):**
   - `audio`: (file) выберите ваш аудиофайл
   - `title`: (text) "Bohemian Rhapsody"
   - `artist`: (text) "Queen"
   - `duration`: (text) "354"

**Ответ будет содержать fileId:**
```json
{
  "success": true,
  "fileId": "674d8f9a1234567890abcdef",
  "filename": "song.mp3",
  "size": 5242880,
  "message": "File uploaded successfully"
}
```

---

### Шаг 3: Создание песни в базе данных

Используйте полученный `fileId` в GraphQL mutation:

```graphql
mutation CreateSong {
  createSong(input: {
    title: "Bohemian Rhapsody"
    artist: "Queen"
    duration: 354
    fileId: "674d8f9a1234567890abcdef"  # fileId из шага 2
  }) {
    id
    title
    artist
    duration
    fileId
    uploadedBy {
      id
      username
    }
    createdAt
  }
}
```

**📝 Сохраните song.id из ответа!**

---

### Шаг 4: Создание плейлиста

```graphql
mutation CreatePlaylist {
  createPlaylist(input: {
    title: "My Rock Classics"
    description: "Best rock songs ever"
    isPublic: true
  }) {
    id
    title
    description
    isPublic
    owner {
      username
    }
    createdAt
  }
}
```

**📝 Сохраните playlist.id из ответа!**

---

### Шаг 5: Добавление песни в плейлист

```graphql
mutation AddSongToPlaylist {
  addSongToPlaylist(
    playlistId: "PLAYLIST_ID_FROM_STEP_4"
    songId: "SONG_ID_FROM_STEP_3"
  ) {
    id
    order
    playlist {
      title
    }
    song {
      title
      artist
    }
    addedBy {
      username
    }
    createdAt
  }
}
```

---

### Шаг 6: Просмотр плейлиста с песнями

```graphql
query GetPlaylistWithSongs {
  playlist(id: "PLAYLIST_ID") {
    id
    title
    description
    isPublic
    owner {
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
        fileId
      }
      addedBy {
        username
      }
      createdAt
    }
    contributors {
      user {
        username
      }
      role
    }
    createdAt
    updatedAt
  }
}
```

---

## 🔄 Real-time Updates (WebSocket Subscriptions)

### Подписка на добавление песен

```graphql
subscription OnSongAdded {
  songAddedToPlaylist(playlistId: "YOUR_PLAYLIST_ID") {
    id
    order
    song {
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
```

Когда другой пользователь добавит песню в плейлист, вы получите уведомление в реальном времени!

---

## 🎧 Стриминг музыки

Чтобы прослушать загруженную музыку:

```
GET http://localhost:4000/api/upload/stream/YOUR_FILE_ID
```

Или в HTML:
```html
<audio controls>
  <source src="http://localhost:4000/api/upload/stream/YOUR_FILE_ID" type="audio/mpeg">
</audio>
```

---

## 👥 Добавление коллабораторов

```graphql
mutation AddCollaborator {
  addContributor(input: {
    playlistId: "YOUR_PLAYLIST_ID"
    userId: "USER_ID_TO_ADD"
    role: EDITOR  # VIEWER, EDITOR, или ADMIN
  }) {
    id
    role
    user {
      username
      email
    }
    invitedBy {
      username
    }
    createdAt
  }
}
```

**Роли:**
- `VIEWER` - только просмотр
- `EDITOR` - может добавлять/удалять песни
- `ADMIN` - может управлять коллабораторами

---

## 📊 Дополнительные запросы

### Получить все мои плейлисты
```graphql
query MyPlaylists {
  myPlaylists {
    id
    title
    description
    isPublic
    createdAt
  }
}
```

### Получить все публичные плейлисты
```graphql
query PublicPlaylists {
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
```

### Получить все песни
```graphql
query AllSongs {
  songs {
    id
    title
    artist
    duration
    uploadedBy {
      username
    }
    createdAt
  }
}
```

### Удалить песню из плейлиста
```graphql
mutation RemoveSong {
  removeSongFromPlaylist(
    playlistId: "PLAYLIST_ID"
    songId: "SONG_ID"
  )
}
```

### Изменить порядок песен
```graphql
mutation ReorderSongs {
  reorderPlaylistSongs(
    playlistId: "PLAYLIST_ID"
    songIds: ["SONG_ID_1", "SONG_ID_3", "SONG_ID_2"]  # Новый порядок
  ) {
    id
    order
    song {
      title
    }
  }
}
```

---

## 🚀 Быстрый старт (Полный пример)

1. **Запустите сервер:**
   ```bash
   cd server
   npm run dev
   ```

2. **Откройте GraphQL Playground:**
   ```
   http://localhost:4000/graphql
   ```

3. **Зарегистрируйтесь и получите token**

4. **Откройте `upload-music.html` в браузере**

5. **Загрузите музыку и получите fileId**

6. **Создайте песню через GraphQL с этим fileId**

7. **Создайте плейлист**

8. **Добавьте песню в плейлист**

9. **Готово! 🎉**

---

## 🔧 Troubleshooting

### Ошибка "Not authenticated"
- Убедитесь, что вы добавили JWT token в HTTP Headers:
  ```json
  {
    "authorization": "Bearer YOUR_TOKEN_HERE"
  }
  ```

### Ошибка "Invalid file type"
- Поддерживаются только аудиофайлы: MP3, WAV, OGG, FLAC, AAC, M4A

### Ошибка "File too large"
- Максимальный размер файла: 50MB

### MongoDB не подключается
- Убедитесь, что Docker запущен:
  ```bash
  docker-compose up -d mongo
  ```

---

## 📝 Примечания

- Все музыкальные файлы хранятся в MongoDB GridFS
- Поддерживается soft delete (isDeleted flag)
- Real-time обновления через WebSocket subscriptions
- JWT токены действительны 7 дней
- Минимальная длина пароля: 6 символов
