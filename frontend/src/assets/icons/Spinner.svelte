<script>
  export let color = "currentColor";
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  class="h-4 w-4"
  viewBox="0 0 24 24"
  fill="none"
  stroke={color}
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path
    d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
  />
</svg>

<style>
  .spinner {
    animation: rotate 1.5s linear infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
</style>
