<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';
  

  export let lon: number;
  export let lat: number;

  let mapContainer: HTMLElement;
  let map: maplibregl.Map;

  onMount(() => {
    map = new maplibregl.Map({
      container: mapContainer,
      style: '/api/map-style.json',
      center: [lon, lat],
      zoom: 16,
      interactive: false, // Make map non-interactive as requested for style
    });

            map.on('load', () => {
      // Hide all text and symbol layers to create a clean, shapes-only map
      const layers = map.getStyle().layers;
      for (const layer of layers) {
        if (layer.type === 'symbol') {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      }

      // Pan map upwards by 30% of the container height to move the center point down
      const offset = mapContainer.offsetHeight * 0.125;
      map.panBy([0, -offset], { animate: false });

      // Create a custom black dot marker element
      const el = document.createElement('div');
      el.className = 'marker';

      // Attach the custom element as the marker
      new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lon, lat])
        .addTo(map);


    });

    
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });
</script>

<div class="map-wrapper" bind:this={mapContainer}></div>

<style>
  .map-wrapper {
    width: 100%;
    height: 100%;
    /* The map style itself is black and white, so no filter is needed. */
  }

  /* Global selector for the custom marker */
  :global(.marker) {
    background-color: black;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    cursor: pointer;
  }



  
</style>
