import type { FTPItem } from "../../types/FTPItem";

interface FTPConnectionParams {
  host: string;
  port: number;
  username: string;
  password: string;
}

interface FTPResponse<T> {
  data?: T;
  error?: string;
}

export class FTPClient {
  private baseUrl: string =
    import.meta.env.VITE_API_URL || "http://localhost:8080";

  async connect(params: FTPConnectionParams): Promise<FTPResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ftp/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.message || "Failed to connect to FTP server" };
      }

      return {};
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async listFiles(path: string = "/"): Promise<FTPResponse<FTPItem[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/ftp/list?path=${encodeURIComponent(path)}`
      );

      if (!response.ok) {
        const error = await response.json();
        return { error: error.message || "Failed to list files" };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async downloadFile(path: string): Promise<FTPResponse<Blob>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/ftp/download?path=${encodeURIComponent(path)}`
      );

      if (!response.ok) {
        const error = await response.json();
        return { error: error.message || "Failed to download file" };
      }

      const blob = await response.blob();
      return { data: blob };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

// Create a singleton instance
export const ftpClient = new FTPClient();
