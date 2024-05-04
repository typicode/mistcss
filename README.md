# 💧 MistCSS

[![Node.js CI](https://github.com/typicode/mistcss/actions/workflows/node.js.yml/badge.svg)](https://github.com/typicode/mistcss/actions/workflows/node.js.yml)

> Write components using CSS only

MistCSS is a new, better and faster way to write visual components. ~~CSS-in-JS~~? Nope! JS-from-CSS 👍

## Write your component in CSS only

```css title="Button.mist.css"
@scope (button.custom-button) {
  :scope {
    background: black;
    color: white;

    &[data-variant="primary"] {
      background: blue;
    }

    &[data-variant="secondary"] {
      background: gray;
    }
  }
}
```

## Get a type-safe component without writing TypeScript

```jsx title="App.tsx"
import { CustomButton } from './Button.mist'

export const App = () => (
  <CustomButton variant="primary">Save</CustomButton>
)
```

MistCSS can generate ⚛️ __React__, 🚀 __Astro__ and 🔥 __Hono__ components. You can use 🍃 __Tailwind CSS__ to style them.

## Documentation

https://typicode.github.io/mistcss

## Supports

Bring your favorite tools:

- [Next.js](https://nextjs.org/)
- [Remix](https://remix.run/)
- [React](https://react.dev/)
- [Vue](https://vuejs.org)
- [Astro](https://astro.build/)
- [Hono](https://hono.dev/)
- [Tailwind CSS](https://tailwindcss.com/)