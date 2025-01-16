import { useCallback } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { useFTPStore } from "../lib/stores/ftpStore";

export default function FilesHeader() {
  const { currentPath, listFiles } = useFTPStore();

  const handleUploadClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await uploadFile(file);
      }
    };
    input.click();
  }, []);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file, file.name);

    try {
      const response = await fetch(
        `http://localhost:8000/api/ftp/upload?path=${encodeURIComponent(
          currentPath + "/" + file.name
        )}`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Upload failed");
      }

      // Refresh the file list after successful upload
      await listFiles(currentPath);
    } catch (error) {
      console.error("Failed to upload file:", error);
      alert(
        "Failed to upload file: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  return (
    <div className="flex justify-between align-middle items-center mb-4 min-h-[60px]">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-100">Files</h2>
        <Breadcrumb />
      </div>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded-md text-sm font-medium bg-[#18202F] hover:bg-[#1E2937] text-white flex items-center gap-2"
          onClick={handleUploadClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Upload
        </button>
        <button
          className="px-4 py-2 rounded-md text-sm font-medium bg-[#18202F] hover:bg-[#1E2937] text-white"
          onClick={() => listFiles(currentPath)}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
