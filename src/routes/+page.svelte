 <script lang="ts">
  import F25Hero from '$lib/components/F25Hero.svelte';
  import FloatingButtons from '$lib/components/FloatingButtons.svelte';
</script>

<F25Hero />
<FloatingButtons />

<style>
  :global(html, body) { 
    margin: 0;
    padding: 0;
    background: #fff;
    /* Prevent scrollbars from the hero component itself */
    overflow: hidden;
  }
</style>
