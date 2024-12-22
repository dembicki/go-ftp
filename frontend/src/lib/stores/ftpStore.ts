import { writable } from "svelte/store";
import type { FTPItem } from "../../types/FTPItem";
import { ftpClient } from "../api/ftpClient";

interface FTPState {
  isConnected: boolean;
  currentPath: string;
  files: FTPItem[];
  error: string | null;
  isLoading: boolean;
}

function createFTPStore() {
  const { subscribe, set, update } = writable<FTPState>({
    isConnected: false,
    currentPath: "/",
    files: [],
    error: null,
    isLoading: false,
  });

  return {
    subscribe,
    connect: async (
      host: string,
      port: number,
      username: string,
      password: string
    ) => {
      update((state) => ({ ...state, isLoading: true, error: null }));

      const result = await ftpClient.connect({
        host,
        port,
        username,
        password,
      });

      if (result.error) {
        update((state) => ({
          ...state,
          error: result.error,
          isLoading: false,
        }));
        return false;
      }

      update((state) => ({ ...state, isConnected: true, isLoading: false }));
      return true;
    },

    listFiles: async (path: string = "/") => {
      update((state) => ({ ...state, isLoading: true, error: null }));

      const result = await ftpClient.listFiles(path);

      if (result.error) {
        update((state) => ({
          ...state,
          error: result.error,
          isLoading: false,
        }));
        return;
      }

      update((state) => ({
        ...state,
        currentPath: path,
        files: result.data || [],
        isLoading: false,
      }));
    },

    downloadFile: async (path: string) => {
      update((state) => ({ ...state, isLoading: true, error: null }));

      const result = await ftpClient.downloadFile(path);

      if (result.error) {
        update((state) => ({
          ...state,
          error: result.error,
          isLoading: false,
        }));
        return;
      }

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(result.data!);
      const a = document.createElement("a");
      a.href = url;
      a.download = path.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      update((state) => ({ ...state, isLoading: false }));
    },
  };
}

export const ftpStore = createFTPStore();
