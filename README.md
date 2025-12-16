Этот файл описывает, как загрузить аудиофайл (песню) в базу данных через REST API, а затем связать её с плейлистом через GraphQL.

1) Получение токена (Authorization)

Для загрузки песни нужен JWT-токен.

Выполните логин или регистрацию через GraphQL.

Скопируйте токен, который вернётся в ответе.

В дальнейших запросах используйте его в заголовке:

Authorization: Bearer <токен>

2) Загрузка песни через REST API (POST /upload)

После запуска приложения отправьте POST запрос:

http://localhost:4000/api/upload/upload

Headers

Добавьте заголовок:

Authorization: Bearer <токен>

Body (multipart/form-data)

В Body выберите Multipart (form-data) и укажите поля:

Key	Type	Value
audio	file	(выберите аудиофайл)
title	text	Название песни
artist	text	Имя артиста
duration	text	Длительность в секундах

Важно:

Поле audio должно быть именно type = file.

duration указывается числом в секундах.

После успешной загрузки песня добавится в базу данных и вернётся её id (songId / id — в зависимости от реализации ответа).

3) Привязка песни к плейлисту через GraphQL

Когда у вас есть:

fileId (id загруженного файла) нужно будет написать этот запрос для добавления песни в базу и получить id песни
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

playlistId (id плейлиста)

Вы можете связать их мутацией addSongToPlaylist:

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


После этого песня будет добавлена в указанный плейлист.

вот примеры запросов для GraphQL 

Registration

mutation Register {
  register(input: {
    username: "Sayat"
    email: "sayat@gmail.com"
    password: "Sayat123"
    firstName: "Sayat"
    lastName: "Sayat"
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


Login

mutation Login {
  login(input: {
    email: "alibi@gmail.com"
    password: "alibialibi"
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


Get Users

query GetUsers {
  users {
    id
    username
    email
    firstName
    lastName
  }
}


Create Playlist

mutation CreatePlaylist {
  createPlaylist(input: {
    title: "Queen hits"
    description: "All Queen hits"
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


