<script lang="ts">
  import { arrow, circle, highlight, mark, underline } from 'stet/svelte'
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from './assets/vite.svg'
  import heroImg from './assets/hero.png'
  import Counter from './lib/Counter.svelte'

  let svelteLogoElement: HTMLImageElement
</script>

<section id="center">
  <div class="hero">
    <img src={heroImg} class="base" width="170" height="179" alt="" />
    <img
      bind:this={svelteLogoElement}
      use:circle={{ seed: 1, stroke: '#ff3e00' }}
      src={svelteLogo}
      class="framework"
      alt="Svelte logo"
    />
    <img src={viteLogo} class="vite" alt="Vite logo" />
  </div>
  <div>
    <h1>
      <span
        class="heading-mark"
        use:underline={{ seed: 2, stroke: '#ff3e00' }}
        use:arrow={{ to: svelteLogoElement, label: 'this bit sparks joy', seed: 3 }}
      >
        Get started
      </span>
    </h1>
    <p use:highlight={{ seed: 4, fill: '#ffb59e' }}>
      Edit <code>src/App.svelte</code> and save to test <code>HMR</code>
    </p>
  </div>
  <Counter />
</section>

<div class="ticks"></div>

<section id="next-steps">
  <div id="docs">
    <svg class="icon" role="presentation" aria-hidden="true">
      <use href="/icons.svg#documentation-icon"></use>
    </svg>
    <h2>Documentation</h2>
    <p>Your questions, answered</p>
    <ul>
      <li>
        <a href="https://vite.dev/" target="_blank" rel="noreferrer">
          <img class="logo" src={viteLogo} alt="" />
          Explore Vite
        </a>
      </li>
      <li>
        <a href="https://svelte.dev/" target="_blank" rel="noreferrer">
          <img class="button-icon" src={svelteLogo} alt="" />
          <span class="mark-target" use:mark={{ kind: 'right', padding: 0, seed: 6 }}>
            Learn more
          </span>
        </a>
      </li>
    </ul>
  </div>
  <div id="social">
    <svg class="icon" role="presentation" aria-hidden="true">
      <use href="/icons.svg#social-icon"></use>
    </svg>
    <h2>Connect with us</h2>
    <p>Join the Vite community</p>
    <ul>
      <li>
        <a href="https://github.com/vitejs/vite" target="_blank" rel="noreferrer">
          <svg class="button-icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#github-icon"></use>
          </svg>
          GitHub
        </a>
      </li>
      <li>
        <a href="https://chat.vite.dev/" target="_blank" rel="noreferrer">
          <svg class="button-icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#discord-icon"></use>
          </svg>
          Discord
        </a>
      </li>
      <li>
        <a href="https://x.com/vite_js" target="_blank" rel="noreferrer">
          <svg class="button-icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#x-icon"></use>
          </svg>
          <span class="mark-target" use:mark={{ kind: 'wrong', padding: 0, seed: 7 }}>X.com</span>
        </a>
      </li>
      <li>
        <a href="https://bsky.app/profile/vite.dev" target="_blank" rel="noreferrer">
          <svg class="button-icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#bluesky-icon"></use>
          </svg>
          Bluesky
        </a>
      </li>
    </ul>
  </div>
</section>

<div class="ticks"></div>
<section id="spacer"></section>
