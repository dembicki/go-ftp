import type { FTPItem } from "../../types/FTPItem";

export interface FTPConnection {
  host: string;
  port: number;
  username: string;
  password: string;
}

export class FTPClient {
  private baseUrl: string = "/api";

  async connect(connection: FTPConnection): Promise<void> {
    const response = await fetch(`http://localhost:8000/api/ftp/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(connection),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to connect: ${response.statusText}`);
    }
  }

  async disconnect(): Promise<void> {
    const response = await fetch(`http://localhost:8000/api/ftp/disconnect`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to disconnect: ${response.statusText}`);
    }
  }

  async listFiles(path: string = "/"): Promise<FTPItem[]> {
    const response = await fetch(
      `http://localhost:8000/api/ftp/list?path=${encodeURIComponent(path)}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.statusText}`);
    }

    return await response.json();
  }

  async downloadFile(path: string): Promise<Blob> {
    const response = await fetch(
      `http://localhost:8000/api/ftp/download?path=${encodeURIComponent(path)}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return await response.blob();
  }

  async uploadFile(path: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${this.baseUrl}/ftp/upload?path=${encodeURIComponent(path)}`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
  }

  async deleteFile(path: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/ftp/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
  }
}

export interface FTPFile {
  name: string;
  size: number;
  modTime: string;
  isDir: boolean;
  path: string;
}
