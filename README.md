# MistCSS

> Simplicity is the ultimate sophistication

MistCSS lets you create reusable visual components without JavaScript or TypeScript (_think about it for a second... no JS/TS needed_).

Leverage native HTML and CSS, get type safety and autocomplete. Just clean and efficient styling.

<img width="1116" alt="Screenshot 2024-11-01 at 03 47 44" src="https://github.com/user-attachments/assets/74aea071-be00-4d03-b43a-e46d6282e4b5">

_What you see above is standard HTML ([data-attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-*)) and CSS ([nested CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting/Using_CSS_nesting)). MistCSS simply creates a `d.ts` file based on your CSS._

## Features

- 🥶 Not just zero-runtime, it goes beyond. It's zero JavaScript, not even for components, resulting in smaller bundles and faster code.
- 💎 What you write is what you get. No transformations, easy debugging.
- 🎒 Standards-based, reusable styles across frameworks, compatible with Tailwind or any CSS framework
- ⚡️ Instantly productive, no learning curve, simple on-boarding.
- 💖 Back to basics with a modern twist: access the full power of HTML and CSS, enhanced with type safety and code completion (without the complexity).

## Differences

|                      | CSS-in-JS                              | MistCSS                       |
| -------------------- | -------------------------------------- | ----------------------------- |
| Runtime              | `~0-10 KB`                             | `0 KB`                        |
| JavaScript functions | `a few KB per component`               | `0 KB`                        |
| TypeScript code      | `yes (at least for props)`             | `no (generated for the user)` |
| Debugging            | `react devtools`                       | `browser inspector`           |
| Syntax highlighting  | `depends (may require extension)`      | `no additional extension`     |
| Generated bundle     | `runtime + JS functions + logic + CSS` | `CSS`                         |

_This is general comparison and may vary depending on the library you're using._

## Usage

Traditional approaches require wrapping your markup/styles in JavaScript functions (`Button.tsx` → `<button/>`, `Input.tsx` → `<input/>`, ...), defining props with TypeScript types, and writing logic to manage class names.

With MistCSS, styling is straightforward and minimal. Here’s how it looks:

`mist.css`

```css
button {
  border-radius: 1rem;
  padding: 1rem;
  background: lightgray;

  &[data-variant='primary'] {
    background-color: black;
    color: white;
  }

  &[data-variant='secondary'] {
    background-color: grey;
    color: white;
  }
}
```

`Page.tsx`

```jsx
<>
  <button data-variant="primary">Save</button>

  {/* TS error, tertiary isn't valid */}
  <button data-variant="tertiary">Save</button>
</>
```

Output

```jsx
<button data-variant="primary">Save</button> {/* Same as in Page.tsx */}
```

_This example demonstrates enums, but MistCSS also supports boolean and string props. For more details, see the FAQ._

## How does it work?

MistCSS parses your `mist.css` file and generates `mist.d.ts` for type safety.

For instance, here’s the generated `mist.d.ts` for our button component:

<!-- prettier-ignore-start -->
```typescript
interface Mist_button extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  'data-variant'?: 'primary' | 'secondary'
}

declare namespace JSX {
  interface IntrinsicElements {
    button: Mist_button // ← <button/> is extended at JSX level to allow 'primary' and 'secondary' values
  }
}
```
<!-- prettier-ignore-stop -->

That’s it! Simple yet powerful, built entirely on browser standards and TypeScript/JSX.

## Install

```sh
npm install mistcss --save-dev
```

`postcss.config.js`

```js
module.exports = {
  plugins: {
    mistcss: {},
  },
}
```

`layout.tsx`

```ts
import './mist.css'
```

## FAQ

### Can I use CSS frameworks like Tailwind or Open Props?

Absolutely, MistCSS is pure HTML and CSS, generating only `mist.d.ts`, so there are no limitations. You can integrate any CSS framework seamlessly. Here are a few examples to get you started:

> [!IMPORTANT]
> For the best experience, set up Tailwind IntelliSense in your editor. Refer to [Tailwind's editor setup guide](https://tailwindcss.com/docs/editor-setup).

#### Tailwind v3 ([@apply](https://tailwindcss.com/docs/functions-and-directives#apply))

```css
button {
  @apply bg-blue-500 text-white;
  /* ... */
}
```

#### Tailwind v3 ([theme](https://tailwindcss.com/docs/functions-and-directives#theme))

```css
button {
  background: theme(colors.blue.500);
  /* ... */
}
```

#### Tailwind v4

Tailwind v4 will support CSS variables natively (see [blog post](https://tailwindcss.com/blog/tailwindcss-v4-alpha)).

#### Tailwind (inline style)

To override some styles, you can use `className`

```jsx
<button data-variant="primary" className="p-12">
  Save
</button>
```

#### Open Props

```css
button {
  background-color: var(--blue-6);
  /* ... */
}
```

### Can I do X without JavaScript?

CSS is more powerful than ever, before reaching for JS, explore if native CSS features can accomplish what you need.

### Can I write `<name>` instead of `data-<name>`?

No, using `<name>` would result in invalid HTML. However, this constraint is actually advantageous.

Firstly, it eliminates the risk of conflicts with native attributes:

```jsx
<>
  <Button type="primary">Save</Button {/* Conflict with button's type="submit" */}
  <button data-type="primary">Save</button> {/* Safe */}
</>
```

Additionally, just by typing `data-` in your editor, autocomplete helps you clearly distinguish your custom attributes from standard tag attributes.

### How to write enum, boolean, string props and conditions?

```css
div[data-component='section']
  /* CSS variables */
  --color: ...;

  /* Default styles */
  background: var(--color, green);
  margin: ...;
  padding: ...;

  /* Enum props */
  &[data-size="sm"] { ... }
  &[data-size="lg"] { ... }

  /* Boolean props */
  &[data-is-active] { ... }

  /* Condition: size="lg" && is-active */
  &[data-size="lg"]&[data-is-active] { ... }

  /* Condition: size="lg" && !is-active */
  &[data-size="lg"]:not([data-is-active]) { ... }
}
```

```jsx
<div
  data-component="section"
  data-size="foo"
  data-is-active
  style={{ '--color': 'red' }}
/>
```

### How to re-use the same tag?

If you want both basic links and button-styled links, here’s how you can do:

```css
a:not([data-component]) { /* ... */ }

a[data-component='button'] {
  &[data-variant='primary'] { /* ... */ }
}
```

<!-- prettier-ignore-start -->
```jsx
<>
  <a href="/home">Home</a>
  <a href="/home" data-component="button">Home</a>
  <a href="/home" data-component="button" data-variant="primary">Home</a>

  {/* TS error, `data-variant` is only valid with `data-component="button"` */}
  <a href="/home" data-variant="primary">Home</a>
</>
```
<!-- prettier-ignore-stop -->

> [!NOTE] > `data-component` is just a naming convention. Feel free to use any attribute, like `data-kind='button'` or just `data-c`. It’s simply a way to differentiate between components using the same tag.

### How to split my code?

You can use CSS [@import](https://developer.mozilla.org/en-US/docs/Web/CSS/@import). For example, in your `mist.css` file:

```css
@import './button.css';
```

### How to build complex components?

`mist.css`

```css
article[data-component='card'] {
  /* ... */
}
div[data-component='card-title'] {
  /* ... */
}
div[data-component='card-content'] {
  /* ... */
}
```

`Card.jsx`

```jsx
export function Card({ title, children }) {
  return (
    <article data-component="card">
      <div data-component="card-title">{title}</div>
      <div data-component="card-content">{children}</div>
    </article>
  )
}
```

> [!TIP]
> To indicate that these styles aren't meant to be used outside of `Card`, you can name them `data-p-component` (`p` for `private`) or use another naming convention.

### How to define CSS variables?

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
}

button {
  background: var(--primary-color)
  /* ... */
```

See also your CSS framework/tooling documentation for ways to define them in JS if you prefer.

### How to Use MistCSS with an External UI?

Assuming you have your UI components in a separate package `my-ui` and you're using Next.js, follow these steps:

`app/layout.tsx`

```tsx
import 'my-ui/mist.css'
```

`app/mist.d.ts`

```typescript
import 'my-ui/mist.d.ts
```

This setup ensures that your Next.js application correctly imports styles and type definitions from your external UI package. It may vary based on tools you're using, but the same principles should apply.

### Origin of the project name?

Mist is inspired by atomized water 💧 often seen near waterfalls. A nod to the _Cascading_ in CSS 🌊.
