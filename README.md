# f25 - Interactive Landing Page

This is a SvelteKit project for an interactive landing page featuring the "f25" brand. The core concept is a dynamic and engaging visual experience that responds to user interaction.

## Key Features

- **Dynamic Typography**: The central "f25" element is not static. The gap between the "f" and the "25" expands and contracts based on the user's pointer speed.
- **Interactive Word Cloud**: As the gap widens, it's filled with a dynamic cloud of words, all starting with the letter "f". The size and opacity of these words scale with the gap, creating a fluid visual effect.
- **Randomized Fonts**: Each time the page is loaded, a new font is randomly selected from a curated list in `src/lib/fonts.ts`, giving the page a fresh look on every visit.
- **Randomized Words**: The pool of words used in the word cloud is a random subset of a larger dictionary found in `src/lib/words.ts`, ensuring variety in content.
- **Responsive Design**: The experience is designed to be smooth and functional on both desktop and mobile devices.
- **Click to Reveal**: Clicking on the hero element reveals a map pointing to a specific location.

## Customization

You can easily customize the experience by editing two key files:

- `src/lib/fonts.ts`: Add or remove any Google Font to change the available typefaces for the hero text.
- `src/lib/words.ts`: Modify the list of "f" words to tailor the content of the interactive word cloud.

## Developing

To get started, install the dependencies and start the development server:

```sh
npm install
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
