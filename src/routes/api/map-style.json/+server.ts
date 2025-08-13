import { json, error } from '@sveltejs/kit';
import { STADIA_API_KEY } from '$env/static/private';

// This endpoint acts as a proxy to the Stadia Maps style,
// securely injecting the API key on the server-side.
export async function GET() {
  if (!STADIA_API_KEY) {
    throw error(500, 'Map API key is not configured on the server.');
  }

  const styleUrl = `https://tiles.stadiamaps.com/styles/stamen_toner.json`;

  try {
    const response = await fetch(styleUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch map style: ${response.statusText}`);
    }

    let style = await response.json();

    // The API key needs to be appended to all tile/sprite/glyph URLs
    const keyQueryParam = `api_key=${STADIA_API_KEY}`;

    for (const sourceName in style.sources) {
      const source = style.sources[sourceName];
      if (source.url) {
        source.url = `${source.url}?${keyQueryParam}`;
      }
      if (source.tiles) {
        source.tiles = source.tiles.map((tileUrl: string) => `${tileUrl}?${keyQueryParam}`);
      }
    }

    if (style.sprite) {
      style.sprite = `${style.sprite}?${keyQueryParam}`;
    }

    if (style.glyphs) {
      style.glyphs = `${style.glyphs}?${keyQueryParam}`;
    }

    return json(style);
  } catch (e: any) {
    console.error(`Map style proxy error: ${e.message}`);
    throw error(502, 'Could not retrieve map style from provider.');
  }
}
