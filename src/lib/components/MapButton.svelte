<script lang="ts">
  import { showMap, userPillsOpen, infoLinkOpen } from '$lib/stores';

  function toggleMap() {
    showMap.update((n) => !n);
    if ($showMap) {
      userPillsOpen.set(false);
      infoLinkOpen.set(false);
    }
  }
</script>

<button class="floating-button" on:click={toggleMap} aria-label="Toggle Map">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 18L4 20V6L9 4M9 18L15 16V4L9 6M9 18V6M15 16L20 18V6L15 4M15 16V4"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round" />
  </svg>
</button>

<style>
  .floating-button {
    background-color: #111;
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: none;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    color: #fff;
  }

  .floating-button:hover {
    transform: translateY(-2px);
    box-shadow: none;
  }
</style>
