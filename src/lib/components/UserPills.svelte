<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { scale } from 'svelte/transition';

  const users = [
    { name: 'shahab', url: 'https://variable.gallery/' },
    { name: 'lilo', url: 'http://www.liloming.de/' },
    { name: 'niko', url: 'http://www.niconitsche.com/' },
    { name: 'daniela', url: 'https://www.daniellebarkay.com/' },
    { name: 'bella', url: 'http://www.textilelab.berlin/' },
    { name: 'elena', url: 'https://www.rabkina.org ' },
    { name: 'maryvonne', url: 'http://www.google.de/' },
  ];
</script>

<div class="pills-container" transition:scale={{ duration: 300, easing: cubicOut }}>
  {#each users as user}
    <a href={user.url} target="_blank" rel="noopener noreferrer" class="pill">
      <span>{user.name}</span>
    </a>
  {/each}
</div>

<style>
  .pills-container {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    align-items: center;
  }

  .pill {
    background: #000;
    color: #fff;
    font-family: var(--brandFont, system-ui, sans-serif);
    padding: 0.5rem 1rem;
    border-radius: 999px;
    text-decoration: none;
    font-size: 1rem;
    box-shadow: none;
    transition: transform 0.2s ease;
    white-space: nowrap;
  }

  .pill:hover {
    transform: translateY(-2px);
  }
</style>
