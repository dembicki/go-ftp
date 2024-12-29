import axios, { AxiosError } from 'axios';
import type { File } from '../../types/FTPItem';

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
  baseURL = 'http://localhost:8000/api';

  axiosInstance = axios.create({
    baseURL: this.baseURL,
    withCredentials: true,
  });

  async connect(connection: FTPConnection): Promise<string> {
    try {
      const response = await this.axiosInstance.post<string>('/ftp/connect', connection);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log('error caught', error);
        throw new Error(error.response?.data?.error || 'Failed to connect');
      }
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.axiosInstance.post('/ftp/disconnect');
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Failed to disconnect');
      }
      throw error;
    }
  }

  async checkSession(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get<{ isConnected: boolean }>(`/ftp/check-session`);
      return response.data.isConnected;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Failed to check session');
      }
      throw error;
    }
  }

  async listFiles(path: string): Promise<File[]> {
    try {
      const response = await this.axiosInstance.get<File[]>(`/ftp/list?path=${path}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Failed to list files');
      }
      throw error;
    }
  }
}
