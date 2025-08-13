// Using Canvas for a synchronous and reliable way to measure text width.
let canvas: HTMLCanvasElement | undefined;

/**
 * Measures the width of a text string given a specific font style.
 * @param text The text to measure.
 * @param font The CSS font string (e.g., 'bold 16px Arial').
 * @returns The width of the text in pixels.
 */
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
