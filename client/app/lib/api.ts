const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;
  
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Books API
export const booksApi = {
  getAll: () => fetchApi<{ books: Book[] }>('/books'),
  getById: (id: string) => fetchApi<{ book: Book }>(`/books/${id}`),
  getChapters: (bookId: string) => fetchApi<{ chapters: Chapter[] }>(`/books/${bookId}/chapters`),
  getCharacters: (bookId: string) => fetchApi<{ characters: Character[] }>(`/books/${bookId}/characters`),
  getLocations: (bookId: string) => fetchApi<{ locations: Location[] }>(`/books/${bookId}/locations`),
  getItems: (bookId: string) => fetchApi<{ items: Item[] }>(`/books/${bookId}/items`),
};

// Chapters API
export const chaptersApi = {
  getById: (id: string) => fetchApi<{ chapter: Chapter }>(`/chapters/${id}`),
  getArt: (chapterId: string) => fetchApi<{ art: Art[] }>(`/chapters/${chapterId}/art`),
};

// Characters API
export const charactersApi = {
  getById: (id: string) => fetchApi<{ character: Character }>(`/characters/${id}`),
  getArt: (characterId: string) => fetchApi<{ art: Art[] }>(`/characters/${characterId}/art`),
};

// Locations API
export const locationsApi = {
  getById: (id: string) => fetchApi<{ location: Location }>(`/locations/${id}`),
  getArt: (locationId: string) => fetchApi<{ art: Art[] }>(`/locations/${locationId}/art`),
};

// Items API
export const itemsApi = {
  getById: (id: string) => fetchApi<{ item: Item }>(`/items/${id}`),
  getArt: (itemId: string) => fetchApi<{ art: Art[] }>(`/items/${itemId}/art`),
};

// Art API
export const artApi = {
  getAll: (page = 1, limit = 20) => 
    fetchApi<{ art: Art[]; total: number; page: number; limit: number }>('/art', { 
      params: { page: String(page), limit: String(limit) } 
    }),
  getById: (id: string) => fetchApi<{ art: Art }>(`/art/${id}`),
  search: (query: string, bookId?: string, chapterId?: string) => {
    const params: Record<string, string> = { q: query };
    if (bookId) params.bookId = bookId;
    if (chapterId) params.chapterId = chapterId;
    return fetchApi<{ art: Art[] }>('/art/search', { params });
  },
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<{ message: string; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, username: string) =>
    fetchApi<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    }),
  logout: () =>
    fetchApi<{ message: string }>('/auth/logout', { method: 'POST' }),
  me: () => fetchApi<{ user: User | null }>('/auth/me'),
};

// Types
export interface Book {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  chapterNumber: number;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  bookId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  bookId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  bookId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Artist {
  id: string;
  name: string;
  profileUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Art {
  id: string;
  bookId: string;
  chapterId: string | null;
  title: string | null;
  description: string | null;
  imageUrl: string;
  artist: string | null;
  artistId: string | null;
  orderIndex: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // Joined data
  characters?: Character[];
  locations?: Location[];
  items?: Item[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}
