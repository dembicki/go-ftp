import { useFTPStore } from "../lib/stores/ftpStore";

export default function StatusBar() {
  const {
    isConnected,
    connectionDetails,
    isLoading: connecting,
  } = useFTPStore();

  return (
    <div className="bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 rounded-b-lg">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center text-sm">
          <div className="flex items-center gap-3">
            <div
              className={`w-2.5 h-2.5 rounded-full shadow-lg ${
                isConnected
                  ? "bg-green-400 shadow-green-500/50"
                  : "bg-red-400 shadow-red-500/50"
              } ${connecting ? "animate-pulse" : ""}`}
            />
            <span className="text-gray-200 font-medium">
              {connecting ? (
                "Connecting..."
              ) : isConnected && connectionDetails ? (
                <>
                  Connected to{" "}
                  <span className="text-blue-300">
                    {connectionDetails.host}:{connectionDetails.port}
                  </span>
                </>
              ) : (
                "Disconnected"
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
