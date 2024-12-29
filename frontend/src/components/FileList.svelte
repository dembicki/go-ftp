<script lang="ts">
  import { formatFileSize } from '../utils/formatFileSize';
  import { formatDate } from '../utils/formatDate';
  import type { File } from '../types/FTPItem';
  import FolderIcon from '../assets/icons/FolderIcon.svelte';
  import FileIcon from '../assets/icons/FileIcon.svelte';
  import { ftpStore } from '../lib/stores/ftpStore';

  $: files = $ftpStore.files;
  $: currentPath = $ftpStore.currentPath;
  $: sortedFiles = files
    .filter((file) => !['.', '..'].includes(file.Name))
    .sort((a, b) => {
      if (a.Type === b.Type) return a.Name.localeCompare(b.Name);
      return a.Type === 'folder' ? -1 : 1;
    });

  $: {
    if (currentPath) {
      ftpStore.listFiles(currentPath);
    }
  }

  async function downloadFile(file: File) {
    try {
      const path =
        $ftpStore.currentPath === '/' ? file.Name : `${$ftpStore.currentPath}/${file.Name}`;

      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = `http://localhost:8000/api/ftp/download?path=${encodeURIComponent(path)}`;
      link.target = '_blank';

      // Add credentials to the request
      link.setAttribute('download', file.Name);

      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download file:', error);
      // You might want to show an error message to the user here
    }
  }

  function handleClick(file: File) {
    if (file.Type === 'file') {
      downloadFile(file);
    }
    if (file.Type !== 'folder') {
      return;
    }
    ftpStore.goToFolder(file.Name);
  }
</script>

<div class="border border-gray-800 rounded-lg overflow-hidden bg-gray-900">
  <div
    class="grid grid-cols-8 md:grid-cols-12 gap-2 md:gap-4 p-3 bg-gray-800 border-gray-800 border-b font-medium text-sm text-gray-300 sticky top-0"
  >
    <div class="col-span-4 md:col-span-5 min-w-0">Name</div>
    <div class="col-span-2 hidden md:block">Type</div>
    <div class="col-span-2 hidden md:block">Size</div>
    <div class="col-span-4 md:col-span-3 min-w-[150px]">Modified</div>
  </div>

  <div class="divide-y divide-gray-800">
    {#if sortedFiles.length === 0}
      <div class="p-3 text-center text-gray-500">No files found</div>
    {:else}
      {#each sortedFiles as file}
        <div
          class="grid grid-cols-8 md:grid-cols-12 gap-2 md:gap-4 p-3 hover:bg-gray-800 transition-colors duration-150 items-center cursor-pointer"
          class:text-gray-300={!file.IsHidden}
          class:text-gray-600={file.IsHidden}
          on:click={() => handleClick(file)}
          on:keydown={(e) => e.key === 'Enter' && handleClick(file)}
          role="button"
          tabindex="0"
          title={file.Type === 'folder' ? 'Open folder' : 'Download file'}
        >
          <div class="col-span-4 md:col-span-5 flex items-center gap-3 min-w-0">
            {#if file.Type === 'folder'}
              <FolderIcon />
            {:else}
              <FileIcon />
            {/if}
            <span class="truncate">{file.Name}</span>
          </div>
          <div class="col-span-2 capitalize hidden md:block">{file.Type}</div>
          <div class="col-span-2 hidden md:block">
            {formatFileSize(file.Size)}
          </div>
          <div class="col-span-4 md:col-span-3 flex items-center justify-between min-w-[150px]">
            <span class="truncate mr-4">{formatDate(file.Modified)}</span>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
