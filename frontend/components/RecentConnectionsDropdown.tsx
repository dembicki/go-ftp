import { useState, useRef, useEffect } from "react";
import { useFTPStore } from "../lib/stores/ftpStore";
import type { FTPConnection } from "../lib/api/apiClient";

export default function RecentConnectionsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { recentConnections, connect, listFiles, clearRecentConnections } =
    useFTPStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (connection: FTPConnection) => {
    try {
      setIsOpen(false);
      await connect(connection);
      await listFiles();
    } catch (err) {
      console.error("Failed to connect:", err);
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all recent connections?")) {
      clearRecentConnections();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-label="Recent connections"
        className="inline-flex items-center justify-center h-[38px] px-4 rounded-r-md text-sm font-medium bg-[#18202F] hover:bg-[#1E2937] text-white border-l border-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {recentConnections.length > 0 ? (
              <>
                {recentConnections.map((connection, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    onClick={() => handleSelect(connection)}
                  >
                    {connection.host}:{connection.port}
                    <div className="text-xs text-gray-500">
                      {connection.username}
                    </div>
                  </button>
                ))}
                <div className="border-t border-gray-700 mt-1">
                  <button
                    className="w-full text-center px-4 py-2 text-sm text-gray-400 hover:text-gray-300 hover:underline"
                    onClick={handleClear}
                  >
                    Clear recent connections
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No recent connections.
                <br />
                Connect to a server to save it here.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
