<script lang="ts">
  import { fade } from 'svelte/transition';
  import { quartOut } from 'svelte/easing';
  import Breadcrumb from './Breadcrumb.svelte';
  import { ftpStore } from '../lib/stores/ftpStore';

  $: currentPath = $ftpStore.currentPath;

  function handleUploadClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await uploadFile(file);
      }
    };
    input.click();
  }

  async function uploadFile(file: globalThis.File) {
    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
      const response = await fetch(
        `http://localhost:8000/api/ftp/upload?path=${encodeURIComponent(currentPath + '/' + file.name)}`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Upload failed');
      }

      // Refresh the file list after successful upload
      await ftpStore.listFiles(currentPath);
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
</script>

<div
  class="flex justify-between align-middle items-center mb-4 min-h-[60px]"
  in:fade={{ duration: 150, easing: quartOut }}
>
  <div class="space-y-2">
    <h2 class="text-xl font-semibold text-gray-100">Files</h2>
    <Breadcrumb />
  </div>

  <div class="flex gap-2">
    <button
      class="px-4 py-2 rounded-md text-sm font-medium bg-[#18202F] hover:bg-[#1E2937] text-white flex items-center gap-2"
      on:click={handleUploadClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
          clip-rule="evenodd"
        />
      </svg>
      Upload
    </button>
    <button
      class="px-4 py-2 rounded-md text-sm font-medium bg-[#18202F] hover:bg-[#1E2937] text-white"
      on:click={() => ftpStore.listFiles(currentPath)}
    >
      Refresh
    </button>
  </div>
</div>
