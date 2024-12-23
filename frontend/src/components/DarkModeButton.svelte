<script lang="ts">
  import MoonIcon from "../assets/icons/MoonIcon.svelte";
  import SunIcon from "../assets/icons/SunIcon.svelte";

  export let darkMode: boolean;
  export let toggleDarkMode: () => void;
</script>

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
