<script lang="ts">
  import clsx from "clsx";
  import SunIcon from "../assets/icons/SunIcon.svelte";
  import MoonIcon from "../assets/icons/MoonIcon.svelte";
  import { ftpStore } from "../lib/stores/ftpStore";

  export let darkMode: boolean;
  export let toggleDarkMode: () => void;
  export let isConnected: boolean;

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
  let error: string | null = null;

  const getInputClasses = (isDark: boolean) =>
    clsx(
      "px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
      isDark
        ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
        : "bg-white border-gray-300 placeholder-gray-400"
    );

  async function handleConnect() {
    if (!formValues.host || !formValues.username || !formValues.password)
      return;

    connecting = true;
    error = null;

    try {
      await ftpStore.connect(formValues);
      isConnected = true;
    } catch (err) {
      isConnected = false;
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
  <div class="flex gap-4 flex-1">
    {#if error}
      <div class="text-red-500 text-sm">{error}</div>
    {/if}
    <input
      class={getInputClasses(darkMode)}
      placeholder="Host"
      bind:value={formValues.host}
      disabled={isConnected}
    />
    <input
      class={getInputClasses(darkMode)}
      placeholder="Port"
      type="number"
      bind:value={formValues.port}
      min="1"
      max="65535"
      disabled={isConnected}
    />
    <input
      class={getInputClasses(darkMode)}
      placeholder="Username"
      bind:value={formValues.username}
      disabled={isConnected}
    />
    <input
      class={getInputClasses(darkMode)}
      type="password"
      placeholder="Password"
      bind:value={formValues.password}
      disabled={isConnected}
    />

    {#if isConnected}
      <button
        class={clsx(
          "px-4 py-2 rounded-md transition-colors",
          connecting
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        )}
        on:click={handleConnect}
        disabled={connecting}
      >
        {connecting ? "Connecting..." : "Connect to FTP"}
      </button>
    {:else}
      <button
        class="px-4 py-2 rounded-md transition-colors bg-red-500 hover:bg-red-600 text-white"
      >
        Disconnect
      </button>
    {/if}
  </div>
  <button
    class="p-2 rounded-full {darkMode
      ? 'text-gray-400 hover:text-gray-300'
      : 'text-gray-600 hover:text-gray-800'}"
    on:click={toggleDarkMode}
  >
    {#if darkMode}
      <SunIcon />
    {:else}
      <MoonIcon />
    {/if}
  </button>
</div>
