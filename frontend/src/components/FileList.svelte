<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { quartOut } from 'svelte/easing';
  import { formatFileSize } from '../utils/formatFileSize';
  import { formatDate } from '../utils/formatDate';
  import type { File } from '../types/FTPItem';
  import FolderIcon from '../assets/icons/FolderIcon.svelte';
  import FileIcon from '../assets/icons/FileIcon.svelte';
  import { ftpStore } from '../lib/stores/ftpStore';

  $: files = $ftpStore.files;
  $: currentPath = $ftpStore.currentPath;
  $: isConnected = $ftpStore.isConnected;
  $: sortedFiles = files
    .filter((file) => !['.', '..'].includes(file.Name))
    .sort((a, b) => {
      if (a.Type === b.Type) return a.Name.localeCompare(b.Name);
      return a.Type === 'folder' ? -1 : 1;
    });

  $: {
    if (currentPath && isConnected) {
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

<div class="file-list">
  {#if !isConnected}
    <div class="no-connection" in:fade={{ duration: 300, easing: quartOut }}>
      <p
        class="text-gray-500 text-center"
        in:scale={{ duration: 300, start: 0.95, easing: quartOut }}
      >
        Not connected to FTP server.<br />
        Please establish a connection to view files.
      </p>
    </div>
  {:else}
    <div
      class="border border-gray-800 rounded-lg overflow-hidden bg-gray-900"
      in:fade={{ duration: 150, easing: quartOut }}
    >
      {#if sortedFiles.length === 0}
        <div class="flex justify-center items-center p-8 text-gray-500 text-sm">
          This folder is empty
        </div>
      {:else}
        <table class="w-full">
          <thead>
            <tr class="bg-gray-800 border-gray-800 border-b text-sm text-gray-300">
              <th class="text-left p-3 w-[40%]">Name</th>
              <th class="text-left p-3 w-[20%]">Type</th>
              <th class="text-left p-3 w-[20%]">Size</th>
              <th class="text-left p-3 w-[20%]">Modified</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            {#each sortedFiles as file, i (file.Name)}
              <tr
                in:fade|local={{ duration: 150, delay: i * 30 }}
                class="hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
                class:text-gray-300={!file.IsHidden}
                class:text-gray-600={file.IsHidden}
                on:click={() => handleClick(file)}
                on:keydown={(e) => e.key === 'Enter' && handleClick(file)}
                role="button"
                tabindex="0"
              >
                <td class="p-3 w-[40%]">
                  <div class="flex items-center gap-3 min-w-0">
                    {#if file.Type === 'folder'}
                      <FolderIcon />
                    {:else}
                      <FileIcon />
                    {/if}
                    <span class="truncate">{file.Name}</span>
                  </div>
                </td>
                <td class="p-3 w-[20%] capitalize">{file.Type}</td>
                <td class="p-3 w-[20%]">{formatFileSize(file.Size)}</td>
                <td class="p-3 w-[20%]">{formatDate(file.Modified)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  {/if}
</div>

<style>
  .file-list {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .no-connection {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }
</style>
