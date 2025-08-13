<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { fWords as RAW_WORDS, ensureFHead } from '$lib/words';
  import { googleFonts } from '$lib/fonts';
  import { PointerTracker } from '$lib/utils';

  // --- DOM Elements ---
  let root: HTMLElement;
  const pointer = new PointerTracker();

  // --- Word Dictionary Setup ---
  const words = Array.from(new Set(ensureFHead(RAW_WORDS).map((w) => w.trim().toLowerCase()).filter(Boolean)));
  const stripF = (w: string) => w.replace(/^f/i, '');
  const byLen = new Map<number, string[]>();
  for (const w of words) {
    const L = stripF(w).length;
    if (!byLen.has(L)) byLen.set(L, []);
    byLen.get(L)!.push(w);
  }

  // --- Animation State ---
  let raf = 0;
  let lastFrameTime = 0;
  let targetGap = 10;
  let currentGap = 10;
  let gapVelocity = 0;
  const springiness = 0.04;
  const damping = 0.85;

  // --- Word Selection State ---
  let displayWord = 'future';
  let lastWordChangeTime = 0;
  let lastWordChangeVelocity = 0;

  // --- Main Animation Loop ---
  function animationLoop(now: number) {
    if (!root) {
      raf = requestAnimationFrame(animationLoop);
      return;
    }
    const dt = Math.min(64, now - lastFrameTime); // Clamp delta time
    lastFrameTime = now;

    // Spring physics for the gap
    const force = (targetGap - currentGap) * springiness;
    gapVelocity += force * (dt / 16.67); // Normalize force to 60fps frame
    gapVelocity *= damping;
    currentGap += gapVelocity * (dt / 16.67);

    // Idle behavior: gently return to min gap
    if (pointer.velocity < 0.01 && Math.abs(targetGap - currentGap) < 1) {
      targetGap = 10;
    }

    // --- Update CSS Variables ---
    const maxGap = Math.max(240, 0.4 * window.innerWidth);
    const gapFraction = Math.max(0, Math.min(1, (currentGap - 10) / (maxGap - 10)));
    
    root.style.setProperty('--gapWidth', `${currentGap.toFixed(2)}px`);
    // The clip-path reveals the word as the gap grows
    root.style.setProperty('--wordClipWidth', `${currentGap.toFixed(2)}px`);

    // Update the word based on gap and velocity
    updateWord(now, pointer.velocity, gapFraction);

    raf = requestAnimationFrame(animationLoop);
  }

  // --- Word Logic ---
  function pickNearestWord(targetLen: number): string | null {
    const maxLen = 48;
    const tl = Math.max(1, Math.min(maxLen, Math.round(targetLen)));
    for (let d = 0; d <= maxLen; d++) {
      const l1 = tl - d, l2 = tl + d;
      if (l1 >= 1 && byLen.has(l1)) return byLen.get(l1)![0];
      if (l2 <= maxLen && byLen.has(l2)) return byLen.get(l2)![0];
    }
    return null;
  }

  function updateWord(now: number, velocity: number, gapFraction: number) {
    const velocityDelta = Math.abs(velocity - lastWordChangeVelocity);
    const isAtMax = gapFraction > 0.98;
    
    if (now - lastWordChangeTime > 400 && (velocityDelta > 0.3 || isAtMax)) {
      const desiredLen = 2 + gapFraction * 30;
      const nextWord = pickNearestWord(desiredLen);
      if (nextWord && nextWord !== displayWord) {
        displayWord = nextWord;
        lastWordChangeTime = now;
        lastWordChangeVelocity = velocity;
      }
    }
  }

  // --- Event Handlers & Lifecycle ---
  function onPointerMove(e: PointerEvent) {
    pointer.update(e);
    const maxGap = Math.max(240, 0.4 * window.innerWidth);
    const vClamped = Math.min(2.5, pointer.velocity);
    targetGap = 10 + (vClamped / 2.5) * (maxGap - 10);
  }

  function loadRandomGoogleFont() {
    if (typeof document === 'undefined') return;
    const chosen = googleFonts[Math.floor(Math.random() * googleFonts.length)];
    const family = chosen.split(':')[0].replace(/\+/g, ' ');
    const href = `https://fonts.googleapis.com/css2?family=${chosen}&display=swap`;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    if (root) {
      root.style.setProperty('--brandFont', `'${family}', system-ui, sans-serif`);
    }
  }

  onMount(() => {
    loadRandomGoogleFont();
    raf = requestAnimationFrame(animationLoop);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  });

  onDestroy(() => {
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onPointerMove);
  });
</script>

<main class="hero" bind:this={root}>
  <h1 class="brand">
    <span class="f">f</span>
    <span class="gap-container" style="width: var(--gapWidth)">
      {#key displayWord}
        <span class="word" in:scale={{ start: 0.9, duration: 250, easing: cubicOut }}>
          {stripF(displayWord)}
        </span>
      {/key}
    </span>
    <span>25</span>
  </h1>
</main>

<style>
  :root {
    --gapWidth: 10px;
    --wordClipWidth: 10px;
    --brandFont: system-ui, sans-serif;
  }

  .hero {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    color: #111;
    font-family: var(--brandFont);
    overflow: hidden;
  }

  .brand {
    display: flex;
    align-items: baseline; /* This is key for vertical alignment */
    font-size: clamp(8rem, 22vw, 24rem);
    font-weight: 700;
    line-height: 1;
    user-select: none;
    margin: 0;
    white-space: nowrap;
  }

  .gap-container {
    display: inline-block; /* Acts as the space, grows with --gapWidth */
    position: relative; /* For positioning the word inside */
    transition: width 120ms ease-out;
  }

  .word {
    position: absolute;
    left: 0;
    bottom: 0;
    /* The word's font size is now inherited from .brand, it doesn't change */
    color: #000;
    /* This is the magic: reveal the word from left to right */
    clip-path: inset(0 calc(100% - var(--wordClipWidth)) 0 0);
    transition: clip-path 40ms linear;
  }
</style>
