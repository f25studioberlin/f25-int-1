import { writable, readable } from 'svelte/store';
import { browser } from '$app/environment';
import { PointerTracker, WordSizer, mapToCurve } from '$lib/utils';
import { fWords as RAW_WORDS } from '$lib/words';
import { googleFonts } from '$lib/fonts';

// --- Store for UI state ---
export const userPillsOpen = writable(false);
export const infoLinkOpen = writable(false);
export const showMap = writable(false);

// --- Store for the main hero animation ---
function createAnimationStore() {
  const { subscribe, set } = writable({
    currentGap: 10,
    displayWord: '',
    fontFamily: 'system-ui, sans-serif',
  });

  if (!browser) {
    return {
      subscribe,
      // Dummy methods for SSR
      init: () => {},
      pointerDown: () => {},
      pointerMove: () => {},
    };
  }

  // --- Private state ---
  let wordSizer: WordSizer | null = null;
  const pointer = new PointerTracker();
  let targetGap = 10;
  let currentGap = 10;
  let gapVelocity = 0;
  const springiness = 0.1;
  const damping = 0.8;
  let displayWord = '';
  let lastWordChangeTime = 0;

  function animationLoop(now: number) {
    const dt = Math.min(64, now - lastFrameTime);
    lastFrameTime = now;

    // Spring physics
    const force = (targetGap - currentGap) * springiness;
    gapVelocity += force * (dt / 16.67);
    gapVelocity *= damping;
    currentGap += gapVelocity * (dt / 16.67);

    // Update target gap from pointer velocity
    pointer.decay();
    const maxAllowedGap = window.innerWidth * 0.8;
    const calculatedTargetGap = mapToCurve(pointer.velocity, 0, 10, 0, 600);
    targetGap = Math.min(calculatedTargetGap, maxAllowedGap);

    // Word selection
    if (wordSizer) {
      const bestFit = wordSizer.findBestFit(currentGap, displayWord);
      const newWord = bestFit ? bestFit.word : '';
      if (newWord !== displayWord && now - lastWordChangeTime > 100) {
        displayWord = newWord;
        lastWordChangeTime = now;
      }
    }

    set({ currentGap, displayWord, fontFamily: document.documentElement.style.getPropertyValue('--brandFont') });
    requestAnimationFrame(animationLoop);
  }

  let lastFrameTime = 0;
  let raf = 0;

  // --- Public methods ---
  async function init(rootElement: HTMLElement) {
    // Font setup
    const chosenFont = googleFonts[Math.floor(Math.random() * googleFonts.length)];
    const family = chosenFont.split(':')[0].replace(/\+/g, ' ');
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(chosenFont)}:wght@400;700&display=swap`;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);
    document.documentElement.style.setProperty('--brandFont', `'${family}', system-ui, sans-serif`);

    await document.fonts.ready;

    // Word setup
    const shuffle = (array: string[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
    const sessionWords = shuffle(
      Array.from(new Set(RAW_WORDS.map((w) => w.trim().toLowerCase()).filter(Boolean)))
    ).slice(0, 100);
    const stripF = (w: string) => w.replace(/^f/i, '');
    const fontStyle = getComputedStyle(rootElement).font;
    wordSizer = new WordSizer(sessionWords.map(stripF), fontStyle);

    // Start animation
    raf = requestAnimationFrame(animationLoop);
  }

  return {
    subscribe,
    init,
    pointerDown: (e: PointerEvent) => pointer.start(e),
    pointerMove: (e: PointerEvent) => pointer.update(e),
  };
}

export const animation = createAnimationStore();
