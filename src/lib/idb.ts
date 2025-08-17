

import { openDB, type IDBPDatabase } from 'idb';
import { type Post, type Artwork, type Discussion, type StoryItem } from './types';

const DB_NAME = 'soma-content-db';
const DB_VERSION = 3;
const POSTS_STORE = 'posts';
const ARTWORKS_STORE = 'artworks';
const DISCUSSIONS_STORE = 'discussions';
const AVATARS_STORE = 'avatars';
const STORIES_STORE = 'storyItems';

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

const getDb = (): Promise<IDBPDatabase<any>> => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(POSTS_STORE)) {
          db.createObjectStore(POSTS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(ARTWORKS_STORE)) {
          db.createObjectStore(ARTWORKS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(DISCUSSIONS_STORE)) {
          db.createObjectStore(DISCUSSIONS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(AVATARS_STORE)) {
            db.createObjectStore(AVATARS_STORE);
        }
        if (oldVersion < 3 && !db.objectStoreNames.contains(STORIES_STORE)) {
          const store = db.createObjectStore(STORIES_STORE, { keyPath: 'id' });
          store.createIndex('by-artist', 'artistId');
        }
      },
    });
  }
  return dbPromise;
};

// Generic Get/Add/Delete/Update functions
const idbGetAll = async <T>(storeName: string): Promise<T[]> => {
  const db = await getDb();
  return db.getAll(storeName);
};

const idbPut = async <T>(storeName:string, item: T) => {
    const db = await getDb();
    await db.put(storeName, item);
}

const idbDelete = async (storeName: string, id: string) => {
    const db = await getDb();
    await db.delete(storeName, id);
}

// Content Stores
export const idbGetPosts = () => idbGetAll<Post>(POSTS_STORE);
export const idbGetArtworks = () => idbGetAll<Artwork>(ARTWORKS_STORE);
export const idbGetDiscussions = () => idbGetAll<Discussion>(DISCUSSIONS_STORE);

export const idbAddPost = (post: Post) => idbPut(POSTS_STORE, post);
export const idbAddArtwork = (artwork: Artwork) => idbPut(ARTWORKS_STORE, artwork);
export const idbAddDiscussion = (discussion: Discussion) => idbPut(DISCUSSIONS_STORE, discussion);

export const idbDeletePost = (id: string) => idbDelete(POSTS_STORE, id);
export const idbDeleteArtwork = (id: string) => idbDelete(ARTWORKS_STORE, id);
export const idbDeleteDiscussion = (id: string) => idbDelete(DISCUSSIONS_STORE, id);

export const idbUpdatePost = (post: Post) => idbPut(POSTS_STORE, post);
export const idbUpdateArtwork = (artwork: Artwork) => idbPut(ARTWORKS_STORE, artwork);
export const idbUpdateDiscussion = (discussion: Discussion) => idbPut(DISCUSSIONS_STORE, discussion);

// Avatar Store
export const idbGetAvatar = async (userId: string): Promise<File | undefined> => {
    const db = await getDb();
    return db.get(AVATARS_STORE, userId);
};

export const idbSetAvatar = async (userId: string, avatarFile: File) => {
    const db = await getDb();
    return db.put(AVATARS_STORE, avatarFile, userId);
};

export const idbDeleteAvatar = async (userId: string) => {
    const db = await getDb();
    return db.delete(AVATARS_STORE, userId);
};

// Story Store
export const idbGetStoryItems = () => idbGetAll<StoryItem>(STORIES_STORE);
export const idbAddStoryItem = (item: StoryItem) => idbPut(STORIES_STORE, item);
export const idbDeleteStoryItem = (id: string) => idbDelete(STORIES_STORE, id);
