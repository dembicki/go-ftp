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
  });

  const api = new APIClient();

  return {
    subscribe,
    connect: async (params: FTPConnection) => {
      await api.connect(params);
      update((state) => ({
        ...state,
        isConnected: true,
        connectionDetails: params,
      }));
    },
    disconnect: async () => {
      await api.disconnect();
      update((state) => ({
        ...state,
        isConnected: false,
        connectionDetails: null,
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
  };
}

export const ftpStore = createFTPStore();
