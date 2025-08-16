<script lang="ts">
  import { userPillsOpen } from '$lib/stores';
  import UserPills from './UserPills.svelte';
  import InfinityLink from './InfinityLink.svelte';

  let infoLinkOpen = false;

  function toggleUserPills() {
    userPillsOpen.update((n) => !n);
    if ($userPillsOpen) {
      infoLinkOpen = false; // Close info if user pills are opened
    }
  }

  function toggleInfoLink() {
    infoLinkOpen = !infoLinkOpen;
    if (infoLinkOpen) {
      userPillsOpen.set(false); // Close user pills if info is opened
    }
  }
</script>

<div class="floating-buttons-container">
  <div class="button-wrapper">
    {#if $userPillsOpen}
      <UserPills />
    {/if}
    <button class="floating-button" on:click={toggleUserPills} aria-label="User Menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/></svg>
    </button>
  </div>
  <div class="button-wrapper">
    {#if infoLinkOpen}
      <InfinityLink />
    {/if}
    <button class="floating-button" on:click={toggleInfoLink} aria-label="Info Menu">
      <span>∞</span>
    </button>
  </div>
</div>

<style>
  .floating-buttons-container {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    display: flex;
    gap: 1rem;
    z-index: 1000;
    font-family: var(--brandFont, system-ui, sans-serif);
  }

  .button-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
  }

  .floating-button {
    background: #000;
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
    color: #fff;
  }

  .floating-button:hover {
    transform: translateY(-2px);
    box-shadow: none;
  }

  .floating-button span {
    font-size: 1.5rem;
    font-style: italic;
    font-weight: 500;
  }
</style>
