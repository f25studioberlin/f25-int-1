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
  public findBestFit(targetWidth: number): SizedWord | null {
    if (this.sizedWords.length === 0) return null;

    let low = 0;
    let high = this.sizedWords.length - 1;
    let bestFitIndex = -1;

    // Handle edge cases
    if (targetWidth < this.sizedWords[0].width) {
      return null; // Gap is too small for any word
    }

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (this.sizedWords[mid].width <= targetWidth) {
            bestFitIndex = mid; // This is a potential best fit
            low = mid + 1; // Try for a larger word
        } else {
            high = mid - 1; // Word is too big, try smaller
        }
    }

    return bestFitIndex !== -1 ? this.sizedWords[bestFitIndex] : null;
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
