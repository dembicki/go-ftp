import { writable } from "svelte/store";
import type { FTPConnection, FTPFile } from "../api/ftpClient";
import { FTPClient } from "../api/ftpClient";

interface FTPState {
  isConnected: boolean;
  currentPath: string;
  files: FTPFile[];
  isLoading: boolean;
  error: string | null;
  connectionDetails: {
    host: string;
    port: number;
    username: string;
    password: string;
  } | null;
}

const createFTPStore = () => {
  const client = new FTPClient();
  const { subscribe, set, update } = writable<FTPState>({
    isConnected: false,
    currentPath: "/",
    files: [],
    isLoading: false,
    error: null,
    connectionDetails: null,
  });

  return {
    subscribe,

    async connect(connection: FTPConnection) {
      try {
        update((state) => ({
          ...state,
          isLoading: true,
          error: null,
          connectionDetails: connection,
        }));
        await client.connect(connection);
        update((state) => ({
          ...state,
          isConnected: true,
          isLoading: false,
        }));
        await this.refreshFiles();
      } catch (error) {
        update((state) => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to connect",
        }));
      }
    },

    async disconnect() {
      try {
        update((state) => ({ ...state, isLoading: true, error: null }));
        await client.disconnect();
        set({
          isConnected: false,
          currentPath: "/",
          files: [],
          isLoading: false,
          error: null,
          connectionDetails: null,
        });
      } catch (error) {
        update((state) => ({
          ...state,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to disconnect",
        }));
      }
    },

    async refreshFiles() {
      let state: FTPState;
      update((s) => {
        state = s;
        return { ...s, isLoading: true, error: null };
      });

      try {
        const files = await client.listFiles(state.currentPath);
        update((s) => ({ ...s, files, isLoading: false }));
      } catch (error) {
        update((s) => ({
          ...s,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to list files",
        }));
      }
    },

    async navigateToDirectory(path: string) {
      update((state) => ({ ...state, currentPath: path }));
      await this.refreshFiles();
    },

    async uploadFile(file: File, path: string) {
      try {
        update((state) => ({ ...state, isLoading: true, error: null }));
        await client.uploadFile(path, file);
        await this.refreshFiles();
      } catch (error) {
        update((state) => ({
          ...state,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to upload file",
        }));
      }
    },

    async deleteFile(path: string) {
      try {
        update((state) => ({ ...state, isLoading: true, error: null }));
        await client.deleteFile(path);
        await this.refreshFiles();
      } catch (error) {
        update((state) => ({
          ...state,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to delete file",
        }));
      }
    },

    async downloadFile(path: string): Promise<Blob> {
      try {
        update((state) => ({ ...state, isLoading: true, error: null }));
        const blob = await client.downloadFile(path);
        update((state) => ({ ...state, isLoading: false }));
        return blob;
      } catch (error) {
        update((state) => ({
          ...state,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to download file",
        }));
        throw error;
      }
    },
  };
};

export const ftpStore = createFTPStore();
