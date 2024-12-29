<script lang="ts">
  import { fade } from 'svelte/transition';
  import { quartOut } from 'svelte/easing';
  import Breadcrumb from './Breadcrumb.svelte';
  import { ftpStore } from '../lib/stores/ftpStore';

  $: currentPath = $ftpStore.currentPath;
</script>

<div
  class="flex justify-between align-middle items-center mb-4 min-h-[60px]"
  in:fade={{ duration: 150, easing: quartOut }}
>
  <div class="space-y-2">
    <h2 class="text-xl font-semibold text-gray-100">Files</h2>
    <Breadcrumb />
  </div>

  <button
    class="px-4 py-2 rounded-md text-sm font-medium bg-gray-800 text-gray-200 hover:bg-gray-700"
    on:click={() => ftpStore.listFiles(currentPath)}
  >
    Refresh
  </button>
</div>
