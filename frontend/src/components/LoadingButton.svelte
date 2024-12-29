<script lang="ts">
  export let isLoading = false;
  export let onclick: (event: MouseEvent) => void;
</script>

<button
  class="group inline-flex items-center justify-center h-[38px] px-6 rounded-l-md text-sm font-medium bg-[#18202F] hover:bg-[#1E2937] text-white relative min-w-[120px]"
  on:click={onclick}
  disabled={isLoading}
>
  {#if isLoading}
    <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
  {:else}
    <slot />
  {/if}
</button>
