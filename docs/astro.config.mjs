import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// https://astro.build/config
export default defineConfig({
  site: 'https://typicode.github.io',
  base: 'mistcss',
  integrations: [
    starlight({
      title: '💧 MistCSS',
      customCss: [
        // Relative path to your custom CSS file
        './src/styles/custom.css',
      ],
      social: {
        twitter: 'https://twitter.com/typicode',
        github: 'https://github.com/typicode/mistcss',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', link: '/intro' },
            { label: 'Quick Start', link: '/start' },
          ],
        },
        {
          label: 'Essentials',
          items: [
            { label: 'Writing Components', link: '/component' },
            { label: 'Ignoring Generated Files', link: '/ignore' },
          ],
        },
        {
          label: 'Integrations',
          autogenerate: { directory: 'integration' },
        },
      ],
    }),
  ],
})
