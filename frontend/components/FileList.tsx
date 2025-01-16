import { useEffect, useMemo } from "react";
import { formatFileSize } from "../utils/formatFileSize";
import { formatDate } from "../utils/formatDate";
import type { File } from "../types/FTPItem";
import FolderIcon from "./icons/FolderIcon";
import FileIcon from "./icons/FileIcon";
import { useFTPStore } from "../lib/stores/ftpStore";
import DownloadIcon from "./icons/DownloadIcon";

export default function FileList() {
  const { files, currentPath, isConnected, listFiles, goToFolder } =
    useFTPStore();

  const sortedFiles = useMemo(
    () =>
      files
        .filter((file) => ![".", ".."].includes(file.Name))
        .sort((a, b) => {
          if (a.Type === b.Type) return a.Name.localeCompare(b.Name);
          return a.Type === "folder" ? -1 : 1;
        }),
    [files]
  );

  useEffect(() => {
    if (currentPath && isConnected) {
      listFiles(currentPath);
    }
  }, [currentPath, isConnected, listFiles]);

  const downloadFile = async (file: File) => {
    try {
      const path =
        currentPath === "/" ? file.Name : `${currentPath}/${file.Name}`;
      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/ftp/download?path=${encodeURIComponent(path)}`;

      window.location.href = url;
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };

  if (!isConnected) {
    return (
      <div className="file-list">
        <div className="no-connection">
          <p className="text-gray-500 text-center">
            Not connected to FTP server.
            <br />
            Please establish a connection to view files.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900">
        {sortedFiles.length === 0 ? (
          <div className="flex justify-center items-center p-8 text-gray-500 text-sm">
            This folder is empty
          </div>
        ) : (
          <table className="w-full" role="grid">
            <thead>
              <tr className="bg-gray-800 border-gray-800 border-b text-sm text-gray-300">
                <th className="text-left p-3 w-[40%]" scope="col">
                  Name
                </th>
                <th className="text-left p-3 w-[20%]" scope="col">
                  Type
                </th>
                <th className="text-left p-3 w-[20%]" scope="col">
                  Size
                </th>
                <th className="text-left p-3 w-[20%]" scope="col">
                  Modified
                </th>
                <th className="text-left p-3 w-[20%]" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sortedFiles.map((file) => (
                <tr
                  key={file.Name}
                  className={`hover:bg-gray-800 transition-colors duration-150 ${
                    file.IsHidden ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  <td className="p-3 w-[40%]">
                    <div className="flex items-center gap-3 min-w-0">
                      {file.Type === "folder" ? <FolderIcon /> : <FileIcon />}
                      <button
                        className="truncate text-left hover:text-blue-400 focus:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                        onClick={() => {
                          if (file.Type === "folder") {
                            goToFolder(file.Name);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (file.Type === "folder") {
                              goToFolder(file.Name);
                            }
                          }
                        }}
                        tabIndex={0}
                        aria-label={`${
                          file.Type === "folder" ? "Open folder" : "File"
                        }: ${file.Name}`}
                        role={file.Type === "folder" ? "button" : "cell"}
                      >
                        {file.Name}
                      </button>
                    </div>
                  </td>
                  <td className="p-3 w-[20%] capitalize">{file.Type}</td>
                  <td className="p-3 w-[20%]">{formatFileSize(file.Size)}</td>
                  <td className="p-3 w-[20%]">{formatDate(file.Modified)}</td>
                  <td className="p-3 flex justify-center">
                    {file.Type === "file" && (
                      <button
                        onClick={() => downloadFile(file)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            downloadFile(file);
                          }
                        }}
                        className="justify-center text-blue-500 hover:text-blue-400 p-2 rounded-full hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`Download ${file.Name}`}
                        title="Download file"
                        tabIndex={0}
                      >
                        <DownloadIcon />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
