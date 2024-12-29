<script lang="ts">
  import ChevronRightIcon from '../assets/icons/ChevronRightIcon.svelte';
  import { ftpStore } from '../lib/stores/ftpStore';

  $: navigationHistory = $ftpStore.navigationHistory;

  function navigateTo(path: string) {
    ftpStore.goToFolder(path);
  }
</script>

<div class="flex items-center gap-2 text-sm text-gray-400">
  <span class="hover:text-blue-400 cursor-pointer" on:click={() => navigateTo('/')}> Home </span>
  {#each navigationHistory as segment}
    <ChevronRightIcon />
    <span class="hover:text-blue-400 cursor-pointer" on:click={() => navigateTo(segment)}>
      {segment}
    </span>
  {/each}
</div>
