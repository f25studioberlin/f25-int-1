<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { fWords as RAW_WORDS } from '$lib/words';
  import { googleFonts } from '$lib/fonts';
  import { PointerTracker, WordSizer, type SizedWord, mapToCurve } from '$lib/utils';
  import Map from '$lib/components/Map.svelte';

  // --- DOM Elements & Utils ---
  let root: HTMLElement;
  let fEl: HTMLElement;
  let wordEl: HTMLElement;
  let twentyFiveEl: HTMLElement;
  let brandEl: HTMLElement;
  const pointer = new PointerTracker();
  let wordSizer: WordSizer | null = null;

  // --- Word Dictionary Setup ---
  const shuffle = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  const stripF = (w: string) => w.replace(/^f/i, '');

  // --- Animation & Word State ---
  let raf = 0;
  let lastFrameTime = 0;
  let targetGap = 10;
  let currentGap = 10;
  let gapVelocity = 0;
  const springiness = 0.1; // Increased for faster reaction
  const damping = 0.8; // Adjusted for new springiness
  const MIN_GAP_FOR_WORD = 20; // Hide word if gap is smaller than this

  let displayWord = ''; // Start with no word
  let lastWordChangeTime = 0;

  // --- Map State ---
  let showMap = false;
  $: heroClass = `hero ${showMap ? 'map-visible' : ''}`;
  const coordinates = { lon: 13.4135834, lat: 52.4898229 }; // Fichtestraße 25

  function toggleMap() {
    showMap = !showMap;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      toggleMap();
    }
  }

  // --- Main Animation Loop ---
  function animationLoop(now: number) {
    raf = requestAnimationFrame(animationLoop);
    if (!root || !wordSizer) return;

    const dt = Math.min(64, now - lastFrameTime);
    lastFrameTime = now;

    // Spring physics for the gap
    const force = (targetGap - currentGap) * springiness;
    gapVelocity += force * (dt / 16.67);
    gapVelocity *= damping;
    currentGap += gapVelocity * (dt / 16.67);

    // On every frame, decay the pointer's velocity and update the target gap accordingly.
    // This ensures the gap smoothly closes when the user stops moving the mouse.
    pointer.decay();
    const maxAllowedGap = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 600;
    const calculatedTargetGap = mapToCurve(pointer.velocity, 0, 10, 0, 600);
    targetGap = Math.min(calculatedTargetGap, maxAllowedGap); // Re-tuned and clamped

    // --- Word Selection (The New Logic) ---
    // The findBestFit function is smart enough to handle all cases, including
    // finding a variety of words when the gap is large. Removing the special
    // case for atMaxGap simplifies the code and improves word variety.
    const bestFit = wordSizer.findBestFit(currentGap, displayWord);

    // --- DEBUG LOGS ---
    console.log({
      velocity: pointer.velocity.toFixed(2),
      targetGap: targetGap.toFixed(2),
      currentGap: currentGap.toFixed(2),
      word: displayWord,
    });

    root.style.setProperty('--current-gap', `${currentGap.toFixed(2)}px`);

    // --- Dynamic Scaling to Fit Viewport ---
    if (brandEl) {
      const brandWidth = brandEl.offsetWidth;
      const screenWidth = window.innerWidth;
      if (brandWidth > screenWidth) {
        const scale = (screenWidth * 0.95) / brandWidth; // 95% to leave some margin
        brandEl.style.transform = `scale(${scale})`;
      } else {
        brandEl.style.transform = 'scale(1)';
      }
    }

    // When the gap shrinks, findBestFit will naturally select smaller words.
    // The word will only be empty if no word can fit at all.
    const newWord = bestFit ? bestFit.word : '';
    if (newWord !== displayWord) {
      if (now - lastWordChangeTime > 100) { // Debounce word changes to prevent flickering
        displayWord = newWord;
        lastWordChangeTime = now;
      }
    }
  }

  // --- Event Handlers & Lifecycle ---
  function onPointerDown(e: PointerEvent) {
    pointer.start(e);
  }

  function onPointerMove(e: PointerEvent) {
    pointer.update(e);
  }

  async function initialize() {
    if (typeof document === 'undefined') return;
    const chosen = googleFonts[Math.floor(Math.random() * googleFonts.length)];
    const family = chosen.split(':')[0].replace(/\+/g, ' ');
    const encodedFontName = encodeURIComponent(chosen);
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFontName}:wght@400;700&display=swap&subset=latin,latin-ext,cyrillic,japanese`;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);
    document.documentElement.style.setProperty('--brandFont', `'${family}', system-ui, sans-serif`);

    // Wait for the new font to be ready before measuring words
    await document.fonts.ready;

    // Shuffle the full word list and take a random subset for this session.
    const sessionWords = shuffle(
      Array.from(new Set(RAW_WORDS.map((w) => w.trim().toLowerCase()).filter(Boolean)))
    ).slice(0, 100); // Use a subset of 100 words per session

    const fontStyle = getComputedStyle(root).font;
    wordSizer = new WordSizer(sessionWords.map(stripF), fontStyle);

    raf = requestAnimationFrame(animationLoop);
  }

  onMount(initialize);

  onDestroy(() => {
    if (browser) {
      cancelAnimationFrame(raf);
    }
  });
</script>

<main bind:this={root}>
  <div
    class={heroClass}
    on:pointerdown={onPointerDown}
    on:pointermove={onPointerMove}
    on:click={toggleMap}
    on:keydown={handleKeydown}
    role="button"
    tabindex="0"
  >
    {#if showMap}
      <div class="map-container">
        <Map lon={coordinates.lon} lat={coordinates.lat} />
      </div>
    {/if}
    <div class="headline-container">
    <h1 class="brand" bind:this={brandEl}>
      <span class="f" bind:this={fEl}>f</span>
      {#key displayWord}
        <span class="word" bind:this={wordEl}>
          {displayWord}
        </span>
      {/key}
      <span class="twenty-five" bind:this={twentyFiveEl}>25</span>
    </h1>
    <span class="tagline">berlin.</span>
  </div>
</div>
</main>

<style>
  :root {
    --brandFont: system-ui, sans-serif;
    --current-gap: 10px;
  }

  .hero {
    width: 100vw;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    color: #111;
    font-family: var(--brandFont);
    overflow: hidden;
    cursor: crosshair;
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

  .hero.map-visible .map-container {
    opacity: 0.25; /* Make it more subtle */
    transform: scale(1);
  }

  .headline-container {
    position: relative;
    z-index: 1;
  }
</style>
