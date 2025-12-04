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
  create: (data: { seriesId: string; title: string; description?: string; coverImageUrl?: string }, token: string) =>
    fetchApi<{ book: Book; message: string }>('/books', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
  delete: (data: { id: string }, token: string) =>
    fetchApi<{ message: string }>(`/books/${data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
  update: (data: { id: string; title?: string; author?: string; description?: string; coverImageUrl?: string }, token: string) =>
    fetchApi<{ book: Book; message: string }>(`/books/${data.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
};

// Series API
export const seriesApi = {
  getAll: () => fetchApi<{ series: Series[] }>('/series'),
  getById: (id: string) => fetchApi<{ series: Series }>(`/series/${id}`),
  getBooks: (seriesId: string) => fetchApi<{ books: Book[] }>(`/series/${seriesId}/books`),
  getCharacters: (seriesId: string) => fetchApi<{ characters: Character[] }>(`/series/${seriesId}/characters`),
  getLocations: (seriesId: string) => fetchApi<{ locations: Location[] }>(`/series/${seriesId}/locations`),
  getItems: (seriesId: string) => fetchApi<{ items: Item[] }>(`/series/${seriesId}/items`),
  create: (data: { title: string; description?: string; coverImageUrl?: string }, token: string) =>
    fetchApi<{ series: Series; message: string }>('/series', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
  delete: (data: { id: string }, token: string) =>
    fetchApi<{ message: string }>(`/series/${data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
  update: (data: { id: string; title?: string; author?: string; description?: string; coverImageUrl?: string }, token: string) =>
    fetchApi<{ series: Series; message: string }>(`/series/${data.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
};

// Chapters API
export const chaptersApi = {
  getById: (id: string) => fetchApi<{ chapter: Chapter }>(`/chapters/${id}`),
  getArt: (chapterId: string) => fetchApi<{ art: Art[] }>(`/chapters/${chapterId}/art`),
  create: (data: { bookId: string; title: string; chapterNumber: number; summary?: string }, token: string) =>
    fetchApi<{ chapter: Chapter; message: string }>('/chapters', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
};

// Characters API
export const charactersApi = {
  getAll: (page = 1, limit = 20) => 
    fetchApi<{ characters: Character[]; total: number; page: number; limit: number }>('/characters', { 
      params: { page: String(page), limit: String(limit) } 
    }),
  getById: (id: string) => fetchApi<{ character: Character }>(`/characters/${id}`),
  getArt: (characterId: string) => fetchApi<{ art: Art[] }>(`/characters/${characterId}/art`),
  getBooks: (characterId: string) => fetchApi<{ books: Book[] }>(`/characters/${characterId}/books`),
  create: (data: { seriesId: string; name: string; description?: string; imageUrl?: string; bookIds?: string[] }, token: string) =>
    fetchApi<{ character: Character }>('/characters', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { name?: string; description?: string; imageUrl?: string; bookIds?: string[] }, token: string) =>
    fetchApi<{ character: Character }>(`/characters/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
  delete: (id: string, token: string) =>
    fetchApi<{ message: string }>(`/characters/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// Locations API
export const locationsApi = {
  getAll: (page = 1, limit = 20) => 
    fetchApi<{ locations: Location[]; total: number; page: number; limit: number }>('/locations', { 
      params: { page: String(page), limit: String(limit) } 
    }),
  getById: (id: string) => fetchApi<{ location: Location }>(`/locations/${id}`),
  getArt: (locationId: string) => fetchApi<{ art: Art[] }>(`/locations/${locationId}/art`),
  getBooks: (locationId: string) => fetchApi<{ books: Book[] }>(`/locations/${locationId}/books`),
  create: (data: { seriesId: string; name: string; description?: string; imageUrl?: string; bookIds?: string[] }, token: string) =>
    fetchApi<{ location: Location }>('/locations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { name?: string; description?: string; imageUrl?: string; bookIds?: string[] }, token: string) =>
    fetchApi<{ location: Location }>(`/locations/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
  delete: (id: string, token: string) =>
    fetchApi<{ message: string }>(`/locations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// Items API
export const itemsApi = {
  getAll: (page = 1, limit = 20) => 
    fetchApi<{ items: Item[]; total: number; page: number; limit: number }>('/items', { 
      params: { page: String(page), limit: String(limit) } 
    }),
  getById: (id: string) => fetchApi<{ item: Item }>(`/items/${id}`),
  getArt: (itemId: string) => fetchApi<{ art: Art[] }>(`/items/${itemId}/art`),
  getBooks: (itemId: string) => fetchApi<{ books: Book[] }>(`/items/${itemId}/books`),
  create: (data: { seriesId: string; name: string; description?: string; imageUrl?: string; bookIds?: string[] }, token: string) =>
    fetchApi<{ item: Item }>('/items', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { name?: string; description?: string; imageUrl?: string; bookIds?: string[] }, token: string) =>
    fetchApi<{ item: Item }>(`/items/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
  delete: (id: string, token: string) =>
    fetchApi<{ message: string }>(`/items/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
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
export interface Series {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  seriesId: string | null;
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
  seriesId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  seriesId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  seriesId: string;
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
