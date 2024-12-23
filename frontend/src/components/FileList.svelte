<script lang="ts">
  import clsx from "clsx";
  import { formatFileSize } from "../utils/formatFileSize";
  import { formatDate } from "../utils/formatDate";
  import type { FTPItem } from "../types/FTPItem";
  import FolderIcon from "../assets/icons/FolderIcon.svelte";
  import FileIcon from "../assets/icons/FileIcon.svelte";
  import DownloadIcon from "../assets/icons/DownloadIcon.svelte";

  export let darkMode: boolean;
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

<div
  class="border {darkMode
    ? 'border-gray-800'
    : 'border-gray-200'} rounded-lg overflow-hidden"
>
  <div
    class="grid grid-cols-12 gap-4 p-3 {darkMode
      ? 'bg-gray-800/50 border-gray-800'
      : 'bg-gray-50 border-gray-200'} border-b font-medium text-sm {darkMode
      ? 'text-gray-300'
      : 'text-gray-500'}"
  >
    <div class="col-span-5">Name</div>
    <div class="col-span-2">Type</div>
    <div class="col-span-2">Size</div>
    <div class="col-span-3">Modified</div>
  </div>

  <div class="divide-y {darkMode ? 'divide-gray-800' : 'divide-gray-200'}">
    {#if sortedFiles.length === 0}
      <div class="p-3 text-center text-gray-500">No files found</div>
    {:else}
      {#each sortedFiles as file}
        <div
          class={clsx(
            "grid grid-cols-12 gap-4 p-3",
            darkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-50",
            "cursor-pointer items-center",
            getTextClasses(darkMode, file.IsHidden)
          )}
        >
          <div class="col-span-5 flex items-center gap-3">
            {#if file.Type === "folder"}
              <FolderIcon />
            {:else}
              <FileIcon />
            {/if}
            <span class="truncate">{file.Name}</span>
          </div>
          <div class="col-span-2 capitalize">{file.Type}</div>
          <div class="col-span-2">{formatFileSize(file.Size)}</div>
          <div class="col-span-3 flex items-center justify-between">
            <span>{formatDate(file.Modified)}</span>
            {#if file.Type === "file"}
              <button
                class="px-2 py-1 text-xs border rounded {darkMode
                  ? 'hover:bg-blue-900/50 text-blue-400 border-blue-900'
                  : 'hover:bg-blue-50 text-blue-600 border-blue-200'} flex items-center gap-1"
              >
                <DownloadIcon />
                Download
              </button>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
