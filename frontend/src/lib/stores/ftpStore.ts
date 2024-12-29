import { writable } from 'svelte/store';
import type { File } from '../../types/FTPItem';
import { APIClient, type FTPConnection } from '../api/apiClient';

interface FTPState {
  connectionDetails: FTPConnection | null;
  isConnected: boolean;
  currentPath: string;
  navigationHistory: string[];
  files: File[];
  error: string | null;
  isLoading: boolean;
  recentConnections: FTPConnection[];
}

const RECENT_CONNECTIONS_KEY = 'ftp_recent_connections';

function loadRecentConnections(): FTPConnection[] {
  try {
    const stored = localStorage.getItem(RECENT_CONNECTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentConnection(connection: FTPConnection) {
  try {
    const recent = loadRecentConnections();
    // Remove any existing connection with same host and port
    const filtered = recent.filter(
      (c) => !(c.host === connection.host && c.port === connection.port)
    );
    // Add new connection to the start
    const updated = [connection, ...filtered].slice(0, 5); // Keep last 5 connections
    localStorage.setItem(RECENT_CONNECTIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

function createFTPStore() {
  const { subscribe, update } = writable<FTPState>({
    connectionDetails: null,
    isConnected: false,
    currentPath: '/',
    navigationHistory: [],
    files: [],
    error: null,
    isLoading: false,
    recentConnections: loadRecentConnections(),
  });

  const api = new APIClient();

  return {
    subscribe,
    connect: async (params: FTPConnection) => {
      update((state) => ({ ...state, isLoading: true }));
      try {
        await api.connect(params);
        const recentConnections = saveRecentConnection(params);
        update((state) => ({
          ...state,
          isConnected: true,
          connectionDetails: params,
          isLoading: false,
          recentConnections,
        }));
      } catch (error) {
        update((state) => ({ ...state, isLoading: false }));
        throw error;
      }
    },
    disconnect: async () => {
      await api.disconnect();
      update((state) => ({
        ...state,
        isConnected: false,
        connectionDetails: null,
        currentPath: '/',
        navigationHistory: [],
        files: [],
      }));
    },
    checkSession: async () => {
      const isConnected = await api.checkSession();
      update((state) => ({
        ...state,
        isConnected: isConnected,
      }));
    },
    listFiles: async (path: string = '/') => {
      const result = await api.listFiles(path);
      update((state) => ({
        ...state,
        files: result,
        currentPath: path,
        navigationHistory: path === '/' ? [] : path.split('/').filter(Boolean),
      }));
    },
    goToFolder: (path: string) => {
      if (path === '/') {
        update((state) => ({
          ...state,
          currentPath: '/',
          navigationHistory: [],
        }));
        return;
      }

      const updateHistory = (state: FTPState, path: string): string[] => {
        const currentFolder = state.navigationHistory[state.navigationHistory.length - 1];

        // if currentPath is home
        if (currentFolder === '/') {
          return [path];
        }

        // if path is in history, remove everything after it
        const index = state.navigationHistory.indexOf(path);
        if (index !== -1) {
          return state.navigationHistory.slice(0, index + 1);
        }

        return [...state.navigationHistory, path];
      };

      const createPath = (navigationHistory: string[]): string => {
        return navigationHistory.join('/');
      };

      update((state) => ({
        ...state,
        currentPath: createPath(updateHistory(state, path)),
        navigationHistory: updateHistory(state, path),
      }));
    },
    clearRecentConnections: () => {
      try {
        localStorage.removeItem(RECENT_CONNECTIONS_KEY);
        update((state) => ({
          ...state,
          recentConnections: [],
        }));
      } catch (error) {
        console.error('Failed to clear recent connections:', error);
      }
    },
  };
}

export const ftpStore = createFTPStore();
