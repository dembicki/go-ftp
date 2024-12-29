<script lang="ts">
  import { ftpStore } from '../lib/stores/ftpStore';
  import LoadingButton from './LoadingButton.svelte';

  // Create local state for form values
  let formValues = {
    host: '',
    port: 21,
    username: '',
    password: '',
  };

  // Initialize from store if available
  $: {
    const storeValues = $ftpStore.connectionDetails;
    if (storeValues) {
      formValues = { ...storeValues };
    }
  }

  let connecting = false;
  $: isConnected = $ftpStore.isConnected;
  let error: string | null = null;

  async function handleConnect(event: MouseEvent | KeyboardEvent) {
    event.preventDefault();
    if (!formValues.host || !formValues.username || !formValues.password) {
      error = 'Please fill in all fields';
      return;
    }

    error = null;
    connecting = true;
    try {
      await ftpStore.connect(formValues);
      await ftpStore.listFiles();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Connection failed';
      // Reset connection state on error
      ftpStore.disconnect();
    } finally {
      connecting = false;
    }
  }

  async function handleDisconnect() {
    try {
      await ftpStore.disconnect();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Disconnect failed';
    }
  }
</script>

<div class="flex border-b border-zinc-200 dark:border-zinc-800 p-4 gap-4 items-center w-full">
  <div class="flex flex-col gap-4 w-full">
    <div class="flex flex-col lg:flex-row gap-4 w-full justify-between">
      <div class="flex flex-col lg:flex-row gap-4 flex-1">
        <input
          class="px-2 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
            bg-[#18202F] text-white border-zinc-200 dark:border-zinc-800
            {isConnected ? 'opacity-30' : ''}"
          placeholder="Host"
          bind:value={formValues.host}
          disabled={isConnected}
        />
        <input
          class="px-2 py-2 w-full lg:w-24 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
            bg-[#18202F] text-white border-zinc-200 dark:border-zinc-800
            {isConnected ? 'opacity-30' : ''}"
          placeholder="Port"
          type="text"
          bind:value={formValues.port}
          disabled={isConnected}
        />
        <input
          class="px-2 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
            bg-[#18202F] text-white border-zinc-200 dark:border-zinc-800
            {isConnected ? 'opacity-30' : ''}"
          placeholder="Username"
          bind:value={formValues.username}
          disabled={isConnected}
        />
        <input
          class="px-2 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
            bg-[#18202F] text-white border-zinc-200 dark:border-zinc-800
            {isConnected ? 'opacity-30' : ''}"
          placeholder="Password"
          type="password"
          bind:value={formValues.password}
          disabled={isConnected}
          on:keypress={(e) => {
            if (e.key === 'Enter' && !isConnected) {
              e.preventDefault();
              handleConnect(e);
            }
          }}
        />
      </div>

      <div class="flex gap-2 lg:gap-4 lg:ml-4">
        {#if !isConnected}
          <LoadingButton isLoading={connecting} onclick={handleConnect}>Connect</LoadingButton>
        {:else}
          <button
            on:click={handleDisconnect}
            class="group w-full lg:w-auto inline-flex items-center justify-center px-6 py-2 rounded-md transition-colors bg-[#18202F] hover:bg-[#1E2937] text-white relative min-w-[120px]"
          >
            <span class="absolute group-hover:opacity-0 transition-opacity">Connected 🛜</span>
            <span class="opacity-0 group-hover:opacity-100 transition-opacity">Disconnect 🚧</span>
          </button>
        {/if}
      </div>
    </div>

    {#if error}
      <div class="flex text-center items-center gap-2 w-full">
        <div class="text-red-500 mx-auto text-sm">{error}</div>
      </div>
    {/if}
  </div>
</div>
