<script lang="ts">
  import clsx from "clsx";
  import ConnectionPanel from "./components/ConnectionPanel.svelte";
  import FileList from "./components/FileList.svelte";
  import { ftpStore } from "./lib/stores/ftpStore";

  const files = $ftpStore.files;

  // Initialize dark mode from localStorage
  let darkMode = localStorage.getItem("darkMode") === "true";

  // Toggle dark mode function with localStorage
  function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem("darkMode", darkMode.toString());
  }
</script>

<main
  class={clsx(
    "flex justify-center items-center min-h-screen",
    darkMode ? "bg-gray-950" : "bg-gray-100"
  )}
>
  <div
    class={clsx(
      "h-5/6 w-5/6 rounded-lg shadow-xl",
      darkMode ? "bg-gray-900" : "bg-white"
    )}
  >
    <ConnectionPanel {darkMode} {toggleDarkMode} />

    <div
      class="flex h-[calc(100%-4rem)] {darkMode ? 'bg-gray-900' : 'bg-gray-50'}"
    >
      <div class="flex-1 p-6">
        <div class="flex justify-between items-center mb-4">
          <div class="space-y-2">
            <h2
              class="text-xl font-semibold {darkMode
                ? 'text-gray-100'
                : 'text-gray-900'}"
            >
              Files
            </h2>
            <div
              class="flex items-center gap-2 text-sm {darkMode
                ? 'text-gray-400'
                : 'text-gray-600'}"
            >
              <span
                class="{darkMode
                  ? 'hover:text-blue-400'
                  : 'hover:text-blue-600'} cursor-pointer"
              >
                Home
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="font-medium">Current Directory</span>
            </div>
          </div>
        </div>

        <FileList {darkMode} {files} />
      </div>
    </div>
  </div>
</main>
