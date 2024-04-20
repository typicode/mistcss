import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://typicode.github.io',
  base: 'mistcss',
  integrations: [
    starlight({
      title: 'MistCSS',
      logo: { src: './src/assets/emoji_u1f32c.svg' },
      customCss: [
        // Relative path to your custom CSS file
        './src/styles/custom.css',
      ],
      social: {
        github: 'https://github.com/typicode/mistcss',
      },
      sidebar: [
        {
          label: 'Basics',
          items: [
            { label: 'Introduction', link: '/intro' },
            { label: 'Installation', link: '/install' },
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
