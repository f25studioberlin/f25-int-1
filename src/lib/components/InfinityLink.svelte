<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { scale } from 'svelte/transition';

  const iteration = {
    name: 'f25-int-1',
    url: 'https://github.com/f25studioberlin/f25-int-1'
  };
</script>

<div class="infinity-link-container" transition:scale={{ duration: 300, easing: cubicOut }}>
  <a href={iteration.url} target="_blank" rel="noopener noreferrer" class="infinity-link">
    <span>{iteration.name}</span>
  </a>
</div>

<style>
  .infinity-link-container {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 1rem;
    background: #000;
    border-radius: 999px;
    box-shadow: none;
    padding: 0.5rem 1rem;
    font-family: var(--brandFont, system-ui, sans-serif);
  }

  .infinity-link {
    display: block;
    color: #fff;
    text-decoration: none;
    font-size: 1rem;
    white-space: nowrap;
  }
</style>
