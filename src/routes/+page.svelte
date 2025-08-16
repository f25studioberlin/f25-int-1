 <script lang="ts">
  import { showMap } from '$lib/stores';
  import F25Hero from '$lib/components/F25Hero.svelte';
  import FloatingButtons from '$lib/components/FloatingButtons.svelte';
  import Map from '$lib/components/Map.svelte';

  const coordinates = { lon: 13.4135834, lat: 52.4898229 }; // Fichtestraße 25
</script>

{#if $showMap}
  <div class="map-container" class:visible={$showMap}>
    <Map lon={coordinates.lon} lat={coordinates.lat} />
  </div>
{/if}

<F25Hero />
<FloatingButtons />

<style>
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

  .map-container.visible {
    opacity: 0.25;
    transform: scale(1);
  }
</style>

