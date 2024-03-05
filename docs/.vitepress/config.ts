import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'MistCSS',
  description: 'Write atomic React components using only CSS',
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="85">🌬️</text></svg>',
      },
    ],
  ],
  base: '/mistcss/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'Sponsor', link: 'https://github.com/sponsors/typicode' },
    ],

    sidebar: [
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Integrate to your Workflow', link: '/workflow' },
      { text: 'Roadmap', link: '/roadmap' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/typicode/mistcss' },
      { icon: 'twitter', link: 'https://twitter.com/typicode' },
    ],
  },
})
