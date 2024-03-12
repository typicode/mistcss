# MistCSS 🌬️

[![Node.js CI](https://github.com/typicode/mistcss/actions/workflows/node.js.yml/badge.svg)](https://github.com/typicode/mistcss/actions/workflows/node.js.yml)

> Write React components using CSS only

MistCSS is a new, better and faster way to write visual components. ~~CSS-in-JS~~? Nope! JS-from-CSS 👍

View the [site](https://typicode.github.io/mistcss) to learn more.

Supports Next.js, Remix and TailwindCSS. More to come.

`Paragraph.mist.css`

```css
@scope (.paragraph) {
  p:scope {
    color: black;

    &[data-error] {
      color: red;
    }
  }
}
```

`App.jsx`

```jsx
import { Paragraph } from 'Paragraph.mist.css'

export default const App = () => (
  <main>
    <Paragraph>I'm a React component written in CSS only</Paragraph>
    <Paragraph error>props can be passed</Paragraph>

    {/* 💥 TypeScript will catch errors */}
    <Paragraph eror>typo</Paragraph>
    <Paragraph type="button">invalid prop</Paragraph>
  </main>
)
```

## Documentation

https://typicode.github.io/mistcss

## Why the name?

C in CSS stands for cascade 🌊 → atomized water forms mist 🌫️ → MistCSS creates pure CSS atomic components 🌬️
