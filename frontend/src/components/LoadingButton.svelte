<script lang="ts">
  import Spinner from '../assets/icons/Spinner.svelte';
  let { isLoading, ...rest } = $props();
</script>

<button
  class="flex items-center justify-center gap-2 rounded-md px-6 py-2
    bg-[#18202F] text-white hover:bg-[#1E2937]
    disabled:opacity-50 disabled:cursor-not-allowed
    w-full lg:w-auto min-w-[120px]"
  {...rest}
>
  {#if isLoading}
    <Spinner />
  {:else}
    {'Connect to FTP'}
  {/if}
</button>
