<script lang="ts">
  import { ftpStore } from '../lib/stores/ftpStore';
  import type { FTPConnection } from '../lib/api/apiClient';
  import { fade } from 'svelte/transition';
  import { clickOutside } from '../lib/actions/clickOutside';

  let isOpen = false;
  $: recentConnections = $ftpStore.recentConnections;

  async function handleSelect(connection: FTPConnection) {
    try {
      isOpen = false;
      await ftpStore.connect(connection);
      await ftpStore.listFiles();
    } catch (err) {
      console.error('Failed to connect:', err);
    }
  }

  function handleClear() {
    if (confirm('Are you sure you want to clear all recent connections?')) {
      ftpStore.clearRecentConnections();
      isOpen = false;
    }
  }
</script>

<div class="relative" use:clickOutside={() => (isOpen = false)}>
  <button
    aria-label="Recent connections"
    class="inline-flex items-center justify-center h-[38px] px-4 rounded-r-md text-sm font-medium bg-[#18202F] hover:bg-[#1E2937] text-white border-l border-gray-700"
    on:click={() => (isOpen = !isOpen)}
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clip-rule="evenodd"
      />
    </svg>
  </button>

  {#if isOpen}
    <div
      class="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10"
      in:fade={{ duration: 100 }}
    >
      <div class="py-1" role="menu" aria-orientation="vertical">
        {#if recentConnections.length > 0}
          {#each recentConnections as connection}
            <button
              class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              on:click={() => handleSelect(connection)}
            >
              {connection.host}:{connection.port}
              <div class="text-xs text-gray-500">
                {connection.username}
              </div>
            </button>
          {/each}
          <div class="border-t border-gray-700 mt-1">
            <button
              class="w-full text-center px-4 py-2 text-sm text-gray-400 hover:text-gray-300 hover:underline"
              on:click={handleClear}
            >
              Clear recent connections
            </button>
          </div>
        {:else}
          <div class="px-4 py-3 text-sm text-gray-500 text-center">
            No recent connections.<br />
            Connect to a server to save it here.
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
