<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { fWords as RAW_WORDS, ensureFHead } from '$lib/words';
  import { googleFonts } from '$lib/fonts';
  import { PointerTracker, WordSizer, type SizedWord, mapToCurve } from '$lib/utils';

  // --- DOM Elements & Utils ---
  let root: HTMLElement;
  let fEl: HTMLElement;
  let wordEl: HTMLElement;
  let twentyFiveEl: HTMLElement;
  const pointer = new PointerTracker();
  let wordSizer: WordSizer | null = null;

  // --- Word Dictionary Setup ---
  const words = Array.from(new Set(ensureFHead(RAW_WORDS).map((w) => w.trim().toLowerCase()).filter(Boolean)));
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
    targetGap = mapToCurve(pointer.velocity, 0, 2.5, 0, 600); // Drastically increased sensitivity

    // --- Word Selection (The New Logic) ---
    const maxGap = Math.max(240, 0.4 * window.innerWidth);
    const atMaxGap = currentGap / maxGap > 0.98;
    const highVelocity = pointer.velocity > 2.0;

    let bestFit: SizedWord | null = null;

    // At max speed, constantly cycle through the longest words
    if (atMaxGap && highVelocity && now - lastWordChangeTime > 100) {
      bestFit = wordSizer.getRandomLargeWord();
      lastWordChangeTime = now;
    } else {
      bestFit = wordSizer.findBestFit(currentGap, displayWord);
    }

    // --- DEBUG LOGS ---
    console.log({
      velocity: pointer.velocity.toFixed(2),
      targetGap: targetGap.toFixed(2),
      currentGap: currentGap.toFixed(2),
      word: displayWord,
    });

    root.style.setProperty('--current-gap', `${currentGap.toFixed(2)}px`);

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
    const href = `https://fonts.googleapis.com/css2?family=${chosen}&display=swap`;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    root.style.setProperty('--brandFont', `'${family}', system-ui, sans-serif`);

    // Wait for the new font to be ready before measuring words
    await document.fonts.ready;

    const fontStyle = getComputedStyle(root).font;
    wordSizer = new WordSizer(words.map(stripF), fontStyle);

    raf = requestAnimationFrame(animationLoop);
  }

  onMount(initialize);

  onDestroy(() => {
    if (browser) {
      cancelAnimationFrame(raf);
    }
  });
</script>

<main class="hero" bind:this={root} on:pointerdown={onPointerDown} on:pointermove={onPointerMove}>
  <div class="headline-container">
    <h1 class="brand">
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
</style>
