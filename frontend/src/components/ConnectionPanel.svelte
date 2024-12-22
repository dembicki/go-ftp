<script lang="ts">
  import clsx from "clsx";
  import SunIcon from "../assets/icons/SunIcon.svelte";
  import MoonIcon from "../assets/icons/MoonIcon.svelte";

  export let darkMode: boolean;
  export let toggleDarkMode: () => void;

  const getInputClasses = (isDark: boolean) =>
    clsx(
      "px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
      isDark
        ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
        : "bg-white border-gray-300 placeholder-gray-400"
    );
</script>

<div
  class={clsx(
    "flex border-b p-4 gap-4 items-center",
    darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
  )}
>
  <div class="flex gap-4 flex-1">
    <input class={getInputClasses(darkMode)} placeholder="Host" />
    <input class={getInputClasses(darkMode)} placeholder="Port" type="number" />
    <input class={getInputClasses(darkMode)} placeholder="Username" />
    <input
      class={getInputClasses(darkMode)}
      type="password"
      placeholder="Password"
    />
    <button
      class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
    >
      Connect to FTP
    </button>
  </div>
  <button
    class="p-2 rounded-full {darkMode
      ? 'text-gray-400 hover:text-gray-300'
      : 'text-gray-600 hover:text-gray-800'}"
    on:click={toggleDarkMode}
  >
    {#if darkMode}
      <SunIcon />
    {:else}
      <MoonIcon />
    {/if}
  </button>
</div>
