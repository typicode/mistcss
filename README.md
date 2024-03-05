# MistCSS 🌬️

[![Node.js CI](https://github.com/typicode/mistcss/actions/workflows/node.js.yml/badge.svg)](https://github.com/typicode/mistcss/actions/workflows/node.js.yml)

> Write React components using CSS only

MistCSS is a new, better and faster way to write visual components. ~~CSS-in-JS~~? Nope! JS-from-CSS 👍

View the [site](https://typicode.github.io/mistcss) to learn more.

Supports Next.js, Remix and TailwindCSS. More to come.

```css
@scope (.paragraph) {
  p:scope {
    color: black;

    [data-error] {
      color: red;
    }
  }
}
```

```jsx
import { Paragraph } from 'Paragraph.mist.css'

<Paragraph>I'm React component written in CSS only</Paragraph>
<Paragraph error>I can accept props</Paragraph>
```

## Documentation

https://typicode.github.io/mistcss

## Why the name?

C in CSS stands for cascade 🌊 → atomized water forms mist 🌫️ → MistCSS creates pure CSS atomic components 🌬️
