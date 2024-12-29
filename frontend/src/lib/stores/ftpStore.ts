import { writable } from "svelte/store";
import type { FTPItem } from "../../types/FTPItem";
import { APIClient, type FTPConnection } from "../api/apiClient";

interface FTPState {
  connectionDetails: FTPConnection | null;
  isConnected: boolean;
  currentPath: string;
  files: FTPItem[];
  error: string | null;
  isLoading: boolean;
}

function createFTPStore() {
  const { subscribe, set, update } = writable<FTPState>({
    connectionDetails: null,
    isConnected: false,
    currentPath: "/",
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
    listFiles: async () => {
      const result = await api.listFiles();
      update((state) => ({
        ...state,
        files: result,
      }));
    },
  };
}

export const ftpStore = createFTPStore();
