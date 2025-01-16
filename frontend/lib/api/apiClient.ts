import axios, { AxiosError } from "axios";
import type { File } from "../../types/FTPItem";

export interface FTPConnection {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface FTPFile {
  name: string;
  size: number;
  modTime: string;
  isDir: boolean;
  path: string;
}

export class APIClient {
  baseURL = process.env.NEXT_PUBLIC_API_URL + "/api";

  axiosInstance = axios.create({
    baseURL: this.baseURL,
    withCredentials: true,
  });

  async connect(connection: FTPConnection): Promise<string> {
    try {
      console.log("Sending connection request:", {
        ...connection,
        password: "[REDACTED]",
      });
      const response = await this.axiosInstance.post<string>(
        "/ftp/connect",
        connection
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Connection error: \n" + error.response?.data?.error);
        const errorMessage =
          error.response?.data?.error ||
          "Failed to connect, please check credentails";
        throw new Error(errorMessage);
      }
      throw new Error("An unexpected error occurred while connecting");
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.axiosInstance.post("/ftp/disconnect");
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || "Failed to disconnect");
      }
      throw error;
    }
  }

  async checkSession(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get<{ isConnected: boolean }>(
        `/ftp/check-session`
      );
      return response.data.isConnected;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          console.error(
            error.response?.data?.error || "Failed to check session"
          );
        }
        return false;
      }
      console.error("Unexpected error during session check:", error);
      return false;
    }
  }

  async listFiles(path: string): Promise<File[]> {
    try {
      const response = await this.axiosInstance.get<File[]>(
        `/ftp/list?path=${path}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || "Failed to list files");
      }
      throw error;
    }
  }

  async downloadFile(path: string): Promise<void> {
    try {
      await this.axiosInstance.get(`/ftp/download?path=${path}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to download file"
        );
      }
      throw error;
    }
  }
}
