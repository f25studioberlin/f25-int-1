<script lang="ts">
  import { onMount } from 'svelte';
  import { animation, userPillsOpen, infoLinkOpen, showMap } from '$lib/stores';

  // --- DOM Elements ---
  let root: HTMLElement;
  let brandEl: HTMLElement;

  // --- Component State ---
  $: heroClass = `hero ${$showMap ? 'map-visible' : ''}`;

  // --- Lifecycle ---
  onMount(() => {
    animation.init(root);

    // Dynamic scaling for the brand element
    const resizeObserver = new ResizeObserver(() => {
      if (!brandEl) return;
      const brandWidth = brandEl.offsetWidth;
      const screenWidth = window.innerWidth;
      const scale = (screenWidth * 0.95) / brandWidth;
      brandEl.style.transform = brandWidth > screenWidth ? `scale(${scale})` : 'scale(1)';
    });
    resizeObserver.observe(brandEl);
    return () => resizeObserver.disconnect();
  });

  // --- Event Handlers ---
  
</script>

<main bind:this={root} style="--current-gap: {$animation.currentGap}px; font-family: {$animation.fontFamily}">
  <div
    class={heroClass}
    on:pointerdown={animation.pointerDown}
    on:pointermove={animation.pointerMove}
        role="button"
    tabindex="0"
  >
        <div class="headline-container">
    <h1 class="brand" bind:this={brandEl}>
      <span class="f">f</span>
      {#key $animation.displayWord}
        <span class="word">
          {$animation.displayWord}
        </span>
      {/key}
      <span class="twenty-five">25</span>
    </h1>
    <span class="tagline">berlin.</span>
  </div>
</div>
</main>

<style>
  
  .hero {
    width: 100vw;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    color: #111;
    font-family: inherit;
    overflow: hidden;
    cursor: default;
  }

  .brand {
    position: relative;
    font-family: inherit;
    font-size: 20rem;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
  }

  .brand {
    display: grid;
    grid-template-columns: auto auto auto;
    justify-content: center;
    align-items: baseline;
    column-gap: var(--current-gap);
    transition: column-gap 120ms linear;
  }

  .f,
  .twenty-five {
    color: #000;
  }

  .word {
    color: #000;
    /* The WordSizer ensures the word fits, so no special handling needed */
  }

  .headline-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .tagline {
    font-family: inherit;
    font-size: 10rem; /* Half of headline's 20rem */
    color: #000;
    font-weight: 500; /* Match headline weight */
    line-height: 1;
  }

  @media (max-width: 768px) {
    .brand {
      font-size: 10rem;
    }
    .tagline {
      font-size: 5rem;
    }
  }

  .map-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    opacity: 0;
    transform: scale(1.03);
    transition: opacity 500ms ease-out, transform 500ms ease-out;
  }

  
  .headline-container {
    position: relative;
    z-index: 1;
  }
</style>
