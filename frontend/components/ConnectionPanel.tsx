import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useFTPStore } from "../lib/stores/ftpStore";
import LoadingButton from "./LoadingButton";
import RecentConnectionsDropdown from "./RecentConnectionsDropdown";

interface FormValues {
  host: string;
  port: number;
  username: string;
  password: string;
}

export default function ConnectionPanel() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, connectionDetails, connect, disconnect, listFiles } =
    useFTPStore();

  const {
    register,
    handleSubmit,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      host: connectionDetails?.host || "",
      port: connectionDetails?.port || 21,
      username: connectionDetails?.username || "",
      password: connectionDetails?.password || "",
    },
  });

  useEffect(() => {
    if (!connectionDetails) {
      reset({
        host: "",
        port: 21,
        username: "",
        password: "",
      });
    }
  }, [connectionDetails, reset]);

  const onSubmit = async (formValues: FormValues) => {
    if (isDisconnecting || isConnecting) return;
    clearErrors();
    setIsConnecting(true);
    try {
      await connect(formValues);
      await listFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnect();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isConnected) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="flex border-b border-zinc-200 dark:border-zinc-800 p-4 gap-4 items-center w-full">
      <div className="flex flex-col gap-4 w-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={handleKeyDown}
          className="flex flex-col lg:flex-row gap-4 w-full justify-between"
        >
          <div className="flex flex-col lg:flex-row gap-4 flex-1">
            <input
              {...register("host", { required: true })}
              className={`h-[38px] px-3 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                bg-[#18202F] text-white border-zinc-200 dark:border-zinc-800
                ${isConnected ? "opacity-30" : ""}`}
              placeholder="Host"
              disabled={isConnected}
            />
            <input
              {...register("port", {
                required: true,
                valueAsNumber: true,
                min: 1,
                max: 65535,
              })}
              className={`h-[38px] px-3 w-full lg:w-24 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                bg-[#18202F] text-white border-zinc-200 dark:border-zinc-800
                ${isConnected ? "opacity-30" : ""}`}
              placeholder="Port"
              type="number"
              disabled={isConnected}
            />
            <span>{errors.port?.message}</span>
            <input
              {...register("username", { required: true })}
              className={`h-[38px] px-3 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                bg-[#18202F] text-white border-zinc-200 dark:border-zinc-800
                ${isConnected ? "opacity-30" : ""}`}
              placeholder="Username"
              disabled={isConnected}
            />
            <input
              {...register("password", { required: true })}
              className={`h-[38px] px-3 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                bg-[#18202F] text-white border-zinc-200 dark:border-zinc-800
                ${isConnected ? "opacity-30" : ""}`}
              placeholder="Password"
              type="password"
              disabled={isConnected}
            />
          </div>

          <div className="flex gap-2 lg:gap-4 lg:ml-4">
            {!isConnected ? (
              <div className="inline-flex">
                <LoadingButton
                  isLoading={isConnecting}
                  onClick={handleSubmit(onSubmit)}
                >
                  Connect
                </LoadingButton>
                <RecentConnectionsDropdown />
              </div>
            ) : (
              <button
                onClick={handleDisconnect}
                className="group w-full lg:w-auto inline-flex items-center justify-center px-6 py-2 rounded-md transition-colors bg-[#18202F] hover:bg-[#1E2937] text-white relative min-w-[120px]"
              >
                <span className="absolute group-hover:opacity-0 transition-opacity">
                  Connected 🛜
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  Disconnect 🚧
                </span>
              </button>
            )}
          </div>
        </form>

        {error && !isConnected && (
          <div className="flex text-center items-center gap-2 w-full">
            <div className="text-red-500 mx-auto text-sm">{error}</div>
          </div>
        )}
      </div>
    </div>
  );
}
