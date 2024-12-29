<script lang="ts">
  import ConnectionPanel from './components/ConnectionPanel.svelte';
  import FileList from './components/FileList.svelte';
  import { ftpStore } from './lib/stores/ftpStore';
  import { onMount } from 'svelte';
  import StatusBar from './components/StatusBar.svelte';
  import FilesHeader from './components/FilesHeader.svelte';

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

    <div class="flex h-[calc(100%-4rem)] min-h-[400px] bg-gray-900">
      <div class="flex-1 p-6 flex flex-col">
        {#if isConnected}
          <FilesHeader />
        {/if}
        <div class="flex-1 min-h-0">
          <FileList />
        </div>
      </div>
    </div>
    <StatusBar />
  </div>
</main>
