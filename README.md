# 💧 MistCSS

[![Node.js CI](https://github.com/typicode/mistcss/actions/workflows/node.js.yml/badge.svg)](https://github.com/typicode/mistcss/actions/workflows/node.js.yml)

> Create components with 50% less code

MistCSS is a new, better and faster way to write visual components. ~~CSS-in-JS~~? Nope! JS-from-CSS 👍

All major frameworks are supported.

## 1. Write your component in CSS only

`./src/Button.mist.css`

```css
@scope (button.custom-button) {
  :scope {
    background: black;
    color: white;

    /* 👇 Define component's props directly in your CSS */
    &[data-variant="primary"] {
      background: blue;
    }

    &[data-variant="secondary"] {
      background: gray;
    }
  }
}
```

## 2. Run MistCSS codegen

```shell
mistcss ./src --target=react --watch
# It will create ./src/Button.mist.tsx
```

## 3. Get a type-safe component without writing TypeScript

`./src/App.tsx`

```jsx
import { CustomButton } from './Button.mist'

export const App = () => (
  <>
    <CustomButton variant="primary">Save</CustomButton>

    {/* TypeScript will catch the error */}
    <CustomButton variant="tertiary">Cancel</CustomButton>
  </>
)
```

MistCSS can generate ⚛️ __React__,  💚 __Vue__, 🚀 __Astro__ and 🔥 __Hono__ components. You can use 🍃 __Tailwind CSS__ to style them.

## Documentation

https://typicode.github.io/mistcss

## Supports

- [Next.js](https://nextjs.org/)
- [Remix](https://remix.run/)
- [React](https://react.dev/)
- [Vue](https://vuejs.org)
- [Astro](https://astro.build/)
- [Hono](https://hono.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
