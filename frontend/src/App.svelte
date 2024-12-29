<script lang="ts">
  import ConnectionPanel from './components/ConnectionPanel.svelte';
  import FileList from './components/FileList.svelte';
  import { ftpStore } from './lib/stores/ftpStore';
  import ChevronRightIcon from './assets/icons/ChevronRightIcon.svelte';
  import { onMount } from 'svelte';

  $: files = $ftpStore.files;
  $: isConnected = $ftpStore.isConnected;

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
            <div class="flex items-center gap-2 text-sm text-gray-400">
              <span class="hover:text-blue-400 cursor-pointer">Home</span>
              <ChevronRightIcon />
              <span class="font-medium">Current Directory</span>
            </div>
          </div>

          <button
            class="px-4 py-2 rounded-md text-sm font-medium bg-gray-800 text-gray-200 hover:bg-gray-700"
            on:click={() => ftpStore.listFiles()}
          >
            Refresh
          </button>
        </div>
        <FileList {files} />
      </div>
    </div>
  </div>
</main>
