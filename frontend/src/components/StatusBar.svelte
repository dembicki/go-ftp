<script lang="ts">
  import { ftpStore } from '../lib/stores/ftpStore';

  $: isConnected = $ftpStore.isConnected;
  $: connectionDetails = $ftpStore.connectionDetails;
  $: connecting = $ftpStore.isLoading;
</script>

<div
  class="bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 rounded-b-lg"
>
  <div class="container mx-auto px-4 py-2">
    <div class="flex items-center text-sm">
      <div class="flex items-center gap-3">
        <div
          class="w-2.5 h-2.5 rounded-full {isConnected
            ? 'bg-green-400 shadow-green-500/50'
            : 'bg-red-400 shadow-red-500/50'} 
          {connecting ? 'animate-pulse' : ''} shadow-lg"
        ></div>
        <span class="text-gray-200 font-medium">
          {#if connecting}
            Connecting...
          {:else if isConnected && connectionDetails}
            Connected to <span class="text-blue-300"
              >{connectionDetails.host}:{connectionDetails.port}</span
            >
          {:else}
            Disconnected
          {/if}
        </span>
      </div>
    </div>
  </div>
</div>
