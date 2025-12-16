import { z } from 'zod';
import {
  registerSchema,
  loginSchema,
  createPlaylistSchema,
  createSongSchema,
  mongoIdSchema,
} from '../schemas';
import { validate } from '../validate';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct registration input', () => {
      const input = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      expect(() => validate(registerSchema, input)).not.toThrow();
      const result = validate(registerSchema, input);
      expect(result.email).toBe('test@example.com');
      expect(result.username).toBe('testuser');
    });

    it('should reject username shorter than 3 characters', () => {
      const input = {
        username: 'ab',
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      expect(() => validate(registerSchema, input)).toThrow();
    });

    it('should reject invalid email format', () => {
      const input = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      expect(() => validate(registerSchema, input)).toThrow();
    });

    it('should reject password shorter than 6 characters', () => {
      const input = {
        username: 'testuser',
        email: 'test@example.com',
        password: '12345',
        firstName: 'Test',
        lastName: 'User',
      };

      expect(() => validate(registerSchema, input)).toThrow();
    });

    it('should reject empty first name', () => {
      const input = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        firstName: '',
        lastName: 'User',
      };

      expect(() => validate(registerSchema, input)).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login input', () => {
      const input = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      expect(() => validate(loginSchema, input)).not.toThrow();
      const result = validate(loginSchema, input);
      expect(result.email).toBe('test@example.com');
    });

    it('should reject invalid email format', () => {
      const input = {
        email: 'invalid-email',
        password: 'Password123!',
      };

      expect(() => validate(loginSchema, input)).toThrow();
    });

    it('should reject empty password', () => {
      const input = {
        email: 'test@example.com',
        password: '',
      };

      expect(() => validate(loginSchema, input)).toThrow();
    });
  });

  describe('createPlaylistSchema', () => {
    it('should validate correct playlist input', () => {
      const input = {
        title: 'My Playlist',
        description: 'Description',
        isPublic: true,
      };

      expect(() => validate(createPlaylistSchema, input)).not.toThrow();
      const result = validate(createPlaylistSchema, input);
      expect(result.title).toBe('My Playlist');
    });

    it('should reject empty title', () => {
      const input = {
        title: '',
        description: 'Description',
        isPublic: true,
      };

      expect(() => validate(createPlaylistSchema, input)).toThrow();
    });

    it('should accept optional fields', () => {
      const input = {
        title: 'My Playlist',
      };

      expect(() => validate(createPlaylistSchema, input)).not.toThrow();
    });
  });

  describe('createSongSchema', () => {
    it('should validate correct song input', () => {
      const input = {
        title: 'Test Song',
        artist: 'Test Artist',
        duration: 180,
        fileId: '507f1f77bcf86cd799439011',
      };

      expect(() => validate(createSongSchema, input)).not.toThrow();
    });

    it('should reject negative duration', () => {
      const input = {
        title: 'Test Song',
        artist: 'Test Artist',
        duration: -10,
        fileId: '507f1f77bcf86cd799439011',
      };

      expect(() => validate(createSongSchema, input)).toThrow();
    });

    it('should reject invalid fileId format', () => {
      const input = {
        title: 'Test Song',
        artist: 'Test Artist',
        duration: 180,
        fileId: 'invalid-id',
      };

      expect(() => validate(createSongSchema, input)).toThrow();
    });
  });

  describe('mongoIdSchema', () => {
    it('should validate correct MongoDB ObjectId', () => {
      const validId = '507f1f77bcf86cd799439011';
      expect(() => validate(mongoIdSchema, validId)).not.toThrow();
    });

    it('should reject invalid MongoDB ObjectId format', () => {
      const invalidId = 'invalid-id';
      expect(() => validate(mongoIdSchema, invalidId)).toThrow();
    });

    it('should reject empty string', () => {
      expect(() => validate(mongoIdSchema, '')).toThrow();
    });
  });
});
