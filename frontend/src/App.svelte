<script lang="ts">
  import ConnectionPanel from './components/ConnectionPanel.svelte';
  import FileList from './components/FileList.svelte';
  import { ftpStore } from './lib/stores/ftpStore';
  import { onMount } from 'svelte';
  import Breadcrumb from './components/Breadcrumb.svelte';

  $: isConnected = $ftpStore.isConnected;
  $: currentPath = $ftpStore.currentPath;

  onMount(async () => {
    await ftpStore.checkSession();
    if (isConnected) {
      await ftpStore.listFiles();
    }
  });
</script>

<main class="flex justify-center items-center min-h-screen bg-gray-950">
  <div class="h-5/6 w-5/6 rounded-lg shadow-xl bg-gray-900">
    <ConnectionPanel />

    <div class="flex h-[calc(100%-4rem)] bg-gray-900">
      <div class="flex-1 p-6">
        <div class="flex justify-between align-middle items-center mb-4">
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
        <FileList />
      </div>
    </div>
  </div>
</main>
