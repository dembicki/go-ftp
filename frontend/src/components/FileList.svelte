<script lang="ts">
  import clsx from "clsx";
  import { formatFileSize } from "../utils/formatFileSize";
  import { formatDate } from "../utils/formatDate";
  import type { FTPItem } from "../types/FTPItem";
  import FolderIcon from "../assets/icons/FolderIcon.svelte";
  import FileIcon from "../assets/icons/FileIcon.svelte";
  import DownloadIcon from "../assets/icons/DownloadIcon.svelte";

  export let files: FTPItem[];

  const getTextClasses = (isDark: boolean, isHidden = false) =>
    clsx(
      isHidden
        ? isDark
          ? "text-gray-600"
          : "text-gray-400"
        : isDark
          ? "text-gray-300"
          : "text-gray-900"
    );

  $: sortedFiles = files
    .filter((file) => ![".", ".."].includes(file.Name))
    .sort((a, b) => {
      if (a.Type === b.Type) return a.Name.localeCompare(b.Name);
      return a.Type === "folder" ? -1 : 1;
    });
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
          class={clsx(
            "grid grid-cols-8 md:grid-cols-12 gap-2 md:gap-4 p-3 hover:bg-gray-800 transition-colors duration-150 items-center cursor-pointer",
            getTextClasses(true, file.IsHidden)
          )}
        >
          <div class="col-span-4 md:col-span-5 flex items-center gap-3 min-w-0">
            {#if file.Type === "folder"}
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
          <div
            class="col-span-4 md:col-span-3 flex items-center justify-between min-w-[150px]"
          >
            <span class="truncate mr-4">{formatDate(file.Modified)}</span>
            {#if file.Type === "file"}
              <button
                class="p-1.5 text-xs border rounded-md hover:bg-blue-500/20 hover:border-blue-700 text-blue-400 border-blue-900/50 transition-all duration-150 flex-shrink-0 ml-2"
                title="Download file"
              >
                <DownloadIcon />
              </button>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
