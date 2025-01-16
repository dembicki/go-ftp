"use client";

import { useEffect } from "react";
import { useFTPStore } from "../lib/stores/ftpStore";
import ConnectionPanel from "../components/ConnectionPanel";
import FileList from "../components/FileList";
import StatusBar from "../components/StatusBar";
import FilesHeader from "../components/FilesHeader";

export default function Home() {
  const { isConnected, checkSession, listFiles } = useFTPStore();

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await checkSession();

        if (isConnected) {
          await listFiles();
        }
      } catch (error) {
        console.debug("Session initialization failed:", error);
      }
    };

    initializeConnection();
  }, [checkSession, isConnected, listFiles]);

  return (
    <div className="h-5/6 w-5/6 rounded-lg shadow-xl bg-gray-900">
      <ConnectionPanel />

      <div className="flex h-[calc(100%-4rem)] min-h-[400px] bg-gray-900">
        <div className="flex-1 p-6 flex flex-col">
          {isConnected && <FilesHeader />}
          <div className="flex-1 min-h-0">
            <FileList />
          </div>
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
