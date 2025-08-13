// Using Canvas for a synchronous and reliable way to measure text width.
let canvas: HTMLCanvasElement | undefined;

/**
 * Measures the width of a text string given a specific font style.
 * @param text The text to measure.
 * @param font The CSS font string (e.g., 'bold 16px Arial').
 * @returns The width of the text in pixels.
 */
/**
 * Clamps a number between a minimum and maximum value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Maps a value from an input range to an output range using a nonlinear (cubic-out) curve.
 * @param value The input value.
 * @param inMin The minimum of the input range.
 * @param inMax The maximum of the input range.
 * @param outMin The minimum of the output range.
 * @param outMax The maximum of the output range.
 * @returns The mapped value.
 */
export function mapToCurve(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  // Apply a cubic-out easing function
  const easedT = 1 - Math.pow(1 - t, 3);
  return outMin + easedT * (outMax - outMin);
}

export function getTextWidth(text: string, font: string): number {
  if (typeof document === 'undefined') return text.length * 8; // Fallback for SSR

  const context = (canvas ??= document.createElement('canvas')).getContext('2d');
  if (!context) {
    return text.length * 8; // Fallback if context is not available
  }

  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}

/**
 * Tracks pointer velocity with low-pass filtering for smooth values.
 */
export class PointerTracker {
  private smoothedV = 0;
  private alpha = 1 - Math.exp(-1 / 6); // ~100ms time constant

  /**
   * Call this on every pointer move event to update the velocity.
   * @param e The pointer event from the browser.
   */
  public update(e: PointerEvent): void {
    const instV = Math.hypot(e.movementX ?? 0, e.movementY ?? 0) / 16; // px/ms
    this.smoothedV += (instV - this.smoothedV) * this.alpha;
  }

  /**
   * The current smoothed velocity in pixels/millisecond.
   */
  public get velocity(): number {
    return this.smoothedV;
  }

  /**
   * Decays the velocity over time. Call this on every animation frame.
   */
  public decay(): void {
    // This factor brings the velocity down by ~95% every second if running at 60fps
    this.smoothedV *= 0.95;
  }
}

export interface SizedWord {
  word: string;
  width: number; // width at base font size
}

/**
 * Pre-calculates word widths for efficient lookups.
 */
export class WordSizer {
  private sizedWords: SizedWord[] = [];

  constructor(words: string[], font: string) {
    if (typeof document === 'undefined') return;

    this.sizedWords = words.map(word => ({
      word,
      width: getTextWidth(word, font),
    }));

    // Sort by width for efficient searching
    this.sizedWords.sort((a, b) => a.width - b.width);
  }

  /**
   * Finds the word with the width closest to the target width.
   * Uses binary search for efficiency.
   */
  public findBestFit(targetWidth: number, currentWord: string | null): SizedWord | null {
    if (this.sizedWords.length === 0) return null;

    // Define the acceptable width range (e.g., 80% to 100% of the gap)
    const lowerBoundWidth = targetWidth * 0.8;

    // Find the upper bound: the largest word that fits within targetWidth
    let low = 0;
    let high = this.sizedWords.length - 1;
    let upperBoundIndex = -1;

    if (targetWidth < this.sizedWords[0].width) {
      return null; // Gap is too small for any word
    }

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (this.sizedWords[mid].width <= targetWidth) {
        upperBoundIndex = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    if (upperBoundIndex === -1) {
      return null;
    }

    // Find the lower bound: the first word that is >= lowerBoundWidth
    low = 0;
    high = upperBoundIndex; // No need to search beyond the upper bound
    let lowerBoundIndex = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (this.sizedWords[mid].width >= lowerBoundWidth) {
        lowerBoundIndex = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    if (lowerBoundIndex === -1) {
      // This case shouldn't happen if upperBoundIndex is valid, but as a fallback:
      return this.sizedWords[upperBoundIndex];
    }

    // We have a range of suitable words from lowerBoundIndex to upperBoundIndex
    const candidateWords = this.sizedWords.slice(lowerBoundIndex, upperBoundIndex + 1);

    // Filter out the current word to avoid repetition
    let filteredCandidates = candidateWords.filter((sw) => sw.word !== currentWord);

    // If filtering left no options (e.g., only one word fits), use the original candidates
    if (filteredCandidates.length === 0) {
      filteredCandidates = candidateWords;
    }

    // Pick a random word from the candidates
    const randomIndex = Math.floor(Math.random() * filteredCandidates.length);
    return filteredCandidates[randomIndex];
  }

  /**
   * Gets a random word from the longest 10% of the dictionary.
   */
  public getRandomLargeWord(): SizedWord | null {
    if (this.sizedWords.length === 0) return null;
    const top10PercentIndex = Math.floor(this.sizedWords.length * 0.9);
    const randomIndex = Math.floor(Math.random() * (this.sizedWords.length - top10PercentIndex)) + top10PercentIndex;
    return this.sizedWords[randomIndex];
  }
}
