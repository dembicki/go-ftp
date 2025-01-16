import { create } from "zustand";
import type { File } from "../../types/FTPItem";
import { APIClient, type FTPConnection } from "../api/apiClient";

interface FTPState {
  connectionDetails: FTPConnection | null;
  isConnected: boolean;
  currentPath: string;
  navigationHistory: string[];
  files: File[];
  error: string | null;
  isLoading: boolean;
  recentConnections: FTPConnection[];
  manuallyDisconnected: boolean;

  // Actions
  connect: (params: FTPConnection) => Promise<void>;
  disconnect: () => Promise<void>;
  checkSession: () => Promise<void>;
  listFiles: (path?: string) => Promise<void>;
  goToFolder: (path: string) => void;
  clearRecentConnections: () => void;
}

const RECENT_CONNECTIONS_KEY = "ftp_recent_connections";
const CURRENT_CONNECTION_KEY = "ftp_current_connection";

const loadRecentConnections = (): FTPConnection[] => {
  try {
    const stored = localStorage.getItem(RECENT_CONNECTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentConnection = (connection: FTPConnection): FTPConnection[] => {
  try {
    const recent = loadRecentConnections();
    const filtered = recent.filter(
      (c) => !(c.host === connection.host && c.port === connection.port)
    );
    const updated = [connection, ...filtered].slice(0, 5);
    localStorage.setItem(RECENT_CONNECTIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

const saveCurrentConnection = (connection: FTPConnection) => {
  try {
    const { password, ...connectionWithoutPassword } = connection;
    localStorage.setItem(
      CURRENT_CONNECTION_KEY,
      JSON.stringify(connectionWithoutPassword)
    );
  } catch {
    // Ignore storage errors
  }
};

const loadCurrentConnection = (): FTPConnection | null => {
  try {
    const stored = localStorage.getItem(CURRENT_CONNECTION_KEY);
    if (!stored) return null;

    const connection = JSON.parse(stored);
    // Ensure all required fields are present
    if (!connection.host || !connection.port || !connection.username) {
      return null;
    }
    return {
      ...connection,
      password: "", // Password is not stored for security
    };
  } catch {
    return null;
  }
};

export const useFTPStore = create<FTPState>()((set, get) => {
  const api = new APIClient();

  return {
    // Initial state
    connectionDetails: loadCurrentConnection(),
    isConnected: false,
    currentPath: "/",
    navigationHistory: [],
    files: [],
    error: null,
    isLoading: false,
    recentConnections: loadRecentConnections(),
    manuallyDisconnected: false,

    // Actions
    connect: async (params: FTPConnection) => {
      set({ isLoading: true });
      try {
        await api.connect(params);
        const recentConnections = saveRecentConnection(params);
        saveCurrentConnection(params);
        set({
          isConnected: true,
          connectionDetails: params,
          isLoading: false,
          recentConnections,
          manuallyDisconnected: false,
        });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    disconnect: async () => {
      try {
        await api.disconnect();
        localStorage.removeItem(CURRENT_CONNECTION_KEY);
        set({
          isConnected: false,
          connectionDetails: null,
          currentPath: "/",
          navigationHistory: [],
          files: [],
          error: null,
          isLoading: false,
          manuallyDisconnected: true,
        });
      } catch (error) {
        localStorage.removeItem(CURRENT_CONNECTION_KEY);
        set({
          isConnected: false,
          connectionDetails: null,
          currentPath: "/",
          navigationHistory: [],
          files: [],
          error: null,
          isLoading: false,
          manuallyDisconnected: true,
        });
        throw error;
      }
    },

    checkSession: async () => {
      if (get().manuallyDisconnected) {
        return;
      }

      try {
        const isConnected = await api.checkSession();
        if (isConnected) {
          const savedConnection = loadCurrentConnection();
          set({
            isConnected,
            connectionDetails: savedConnection,
          });
        } else {
          localStorage.removeItem(CURRENT_CONNECTION_KEY);
          set({
            isConnected: false,
            connectionDetails: null,
          });
        }
      } catch (error) {
        localStorage.removeItem(CURRENT_CONNECTION_KEY);
        set({
          isConnected: false,
          connectionDetails: null,
        });
      }
    },

    listFiles: async (path = "/") => {
      const result = await api.listFiles(path);
      set({
        files: result,
        currentPath: path,
        navigationHistory: path === "/" ? [] : path.split("/").filter(Boolean),
      });
    },

    goToFolder: (path: string) => {
      if (path === "/") {
        set({
          currentPath: "/",
          navigationHistory: [],
        });
        return;
      }

      const updateHistory = (state: FTPState, path: string): string[] => {
        const currentFolder =
          state.navigationHistory[state.navigationHistory.length - 1];
        if (currentFolder === "/") return [path];
        const index = state.navigationHistory.indexOf(path);
        if (index !== -1) return state.navigationHistory.slice(0, index + 1);
        return [...state.navigationHistory, path];
      };

      const state = get();
      const newHistory = updateHistory(state, path);
      set({
        currentPath: newHistory.join("/"),
        navigationHistory: newHistory,
      });
    },

    clearRecentConnections: () => {
      try {
        localStorage.removeItem(RECENT_CONNECTIONS_KEY);
        set({ recentConnections: [] });
      } catch (error) {
        console.error("Failed to clear recent connections:", error);
      }
    },
  };
});
