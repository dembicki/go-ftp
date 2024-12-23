import axios from "axios";
import type { FTPItem } from "../../types/FTPItem";

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
  baseURL = "http://localhost:8000/api";

  axiosInstance = axios.create({
    baseURL: this.baseURL,
    withCredentials: true,
  });

  async connect(connection: FTPConnection): Promise<void> {
    try {
      await this.axiosInstance.post("/ftp/connect", connection);
    } catch (error: any) {
      console.log("error catched", error);
      throw new Error(error.response?.data?.error || "Failed to connect");
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.axiosInstance.post("/ftp/disconnect");
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to disconnect");
    }
  }

  async listFiles(path: string = "/"): Promise<FTPItem[]> {
    try {
      const response = await this.axiosInstance.get("/ftp/list", {
        params: { path },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to list files");
    }
  }
}
