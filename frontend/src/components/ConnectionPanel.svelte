<script lang="ts">
  import clsx from "clsx";
  import { ftpStore } from "../lib/stores/ftpStore";
  import DarkModeButton from "./DarkModeButton.svelte";
  import LoadingButton from "./LoadingButton.svelte";

  export let darkMode: boolean;
  export let toggleDarkMode: () => void;

  // Create local state for form values
  let formValues = {
    host: "",
    port: 21,
    username: "",
    password: "",
  };

  // Initialize from store if available
  $: {
    const storeValues = $ftpStore.connectionDetails;
    if (storeValues) {
      formValues = { ...storeValues };
    }
  }

  let connecting = false;
  let isConnected = $ftpStore.isConnected;
  let error: string | null = null;

  async function handleConnect(event: MouseEvent) {
    event.preventDefault();
    if (!formValues.host || !formValues.username || !formValues.password) {
      error = "Please fill in all fields";
      return;
    }

    error = null;
    connecting = true;
    try {
      await ftpStore.connect(formValues);
    } catch (err) {
      error = err instanceof Error ? err.message : "Connection failed";
    } finally {
      connecting = false;
    }
  }
</script>

<div
  class={clsx(
    "flex border-b p-4 gap-4 items-center",
    darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
  )}
>
  <div class="flex flex-col gap-4 flex-1">
    <div class="flex gap-4">
      <input
        class={clsx(
          "px-2 py-2 flex-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
          darkMode
            ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
            : "bg-white border-gray-300 placeholder-gray-400"
        )}
        placeholder="Host"
        bind:value={formValues.host}
        disabled={isConnected}
      />
      <input
        class={clsx(
          "px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
          darkMode
            ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
            : "bg-white border-gray-300 placeholder-gray-400"
        )}
        placeholder="Port"
        type="text"
        bind:value={formValues.port}
        disabled={isConnected}
      />
      <input
        class={clsx(
          "px-3 py-2 flex-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
          darkMode
            ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
            : "bg-white border-gray-300 placeholder-gray-400"
        )}
        placeholder="Username"
        bind:value={formValues.username}
        disabled={isConnected}
      />
      <input
        class={clsx(
          "px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
          darkMode
            ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
            : "bg-white border-gray-300 placeholder-gray-400"
        )}
        type="password"
        placeholder="Password"
        bind:value={formValues.password}
        disabled={isConnected}
      />

      {#if !isConnected}
        <LoadingButton
          isLoading={connecting}
          {isConnected}
          class={clsx(
            "px-4 py-2 rounded-md transition-colors",
            connecting
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          )}
          on:click={handleConnect}
        />
      {/if}
      <DarkModeButton {darkMode} {toggleDarkMode} />
    </div>

    {#if error}
      <div class="flex text-center items-center gap-2 w-full">
        <div class="text-red-500 mx-auto text-sm">{error}</div>
      </div>
    {/if}
  </div>
</div>
