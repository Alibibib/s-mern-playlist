export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  owner: User;
  isPublic: boolean;
  songs: PlaylistSong[];
  contributors: Contributor[];
  createdAt: string;
  updatedAt: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  fileId: string;
  uploadedBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistSong {
  id: string;
  playlist: Playlist;
  song: Song;
  addedBy: User;
  order: number;
  createdAt: string;
}

export interface Contributor {
  id: string;
  playlist: Playlist;
  user: User;
  role: ContributorRole;
  invitedBy: User;
  createdAt: string;
}

export enum ContributorRole {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN',
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
}


