<script lang="ts">
  import Spinner from "../assets/icons/Spinner.svelte";
  let { isLoading, isConnected, ...rest } = $props();
</script>

<button
  {...rest}
  class="px-4 py-2 rounded-md transition-colors bg-blue-500 hover:bg-blue-600 text-white"
  on:click
>
  {#if isLoading}
    <Spinner />
  {:else if isConnected}
    {"Connected"}
  {:else}
    {"Connect to FTP"}
  {/if}
</button>
