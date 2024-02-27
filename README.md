# MistCSS 🌬️

[![Node.js CI](https://github.com/typicode/mistcss/actions/workflows/node.js.yml/badge.svg)](https://github.com/typicode/mistcss/actions/workflows/node.js.yml)

> Write atomic React components using only CSS! (JS-from-CSS™)

## Why?

- CSS is a beautiful language 💖, getting better every year 🚀.
- Easily distinguish between pure visual/atomic components and more complex ones by their extension (`*.mist.css`).
- Write less and focus on style to avoid context-switching with JS, reducing bugs.
- Gain automatic type safety for your React components; MistCSS compiles to TSX.
- Enjoy a zero-runtime experience.
- Works with Next, Remix, Astro, ... any modern React framework.

## Install

```shell
npm install mistcss --save-dev
```

## Usage

### 1. Create your first CSS component

Assuming your React components are in `src/components`, let's create a basic Button component using CSS.

`src/components/Button.mist.css`

```css
@scope (.btn) {
  button:scope {
    /* Default style */
    font-size: 1rem;
    border-radius: 0.25rem;

    &[data-size='lg'] {
      font-size: 1.5rem;
    }

    &[data-size='sm'] {
      font-size: 0.75rem;
    }

    &[data-danger] {
      background-color: red;
      color: white;
    }
  }
}
```

Note: the class in `@scope` needs to be unique across your project. Plans are in place to automate this check.

### 2. Compile to a React component

```shell
mistcss src/components/Button.mist.css
# Creates Button.mist.css.tsx
```

Now, you can import your React component.

```tsx
import { Button } from '.components/Button.mist.css.tsx'

export default function App() {
  return (
    <main>
      <Button size="lg" danger>
        OMG 😱 JS from CSS
      </Button>

      {/* 💥 TypeScript will catch the error here */}
      <Button size="lgg">Submit</Button>
    </main>
  )
}
```

### 3. Integrate it into your workflow

Edit `package.json`:

```json
{
  "scripts": {
    "mistcss-dev": "mistcss ./src --watch",
    "mistcss-build": "mistcss ./src"
  }
}
```

Use tools like [concurrently](https://github.com/open-cli-tools/concurrently) to run it alongside your other scripts in development.

### 4. TailwindCSS (optional)

If you're using NextJS, you may need to add [support for nested declarations](https://tailwindcss.com/docs/using-with-preprocessors#nesting).

Use Tailwind's `@apply` directive to style your CSS component. For example:

```css
&[data-danger] {
  @apply bg-red-700 text-white;
}
```

### 5. Ignoring generated files

Edit `.gitignore`:

```gitignore
*.mist.css.tsx # Ignore compiled files
```

Edit `.prettierignore`:

```gitignore
*.mist.css.tsx # Ignore compiled files
```

Edit `eslint.config.js`:

```js
{
  ignores: ['**/*.mist.css.tsx']
}
```

Edit `.vscode/settings.json`:

```json
{
  "files.exclude": {
    "**/*.mist.css.tsx": true
  }
}
```

## The power of CSS

Since MistCSS uses pure CSS, you can use **all** CSS features:

- Container queries `@container`, ...
- CSS variables `--primary-color`, ...
- Media queries `@media (prefers-color-scheme: dark)`, ...
- And more...

This approach allows you to stay focused on styling without the mental switch to JS.

## Origin of the name

```
The C in CSS stands for cascade 🌊
Atomized water forms mist 🌫️
MistCSS creates pure CSS atomic components 🌬️
```

## Roadmap

MistCSS is a new project, so expect **breaking changes** until `v1.0`.

If you like this idea and want to help, please consider having your company [sponsor](https://github.com/typicode/mistcss) it 🙇. This project is not backed by a large company.

- [x] Release 🥳
- [x] Add TailwindCSS support
- [ ] Add Vite support
- [ ] CLI and compiler improvements
- [ ] v1.0
