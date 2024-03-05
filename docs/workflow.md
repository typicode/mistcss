# Integrate to your workflow

## Package.json

Add `mistcss` command to your `package.json` scripts.

For example, if your project uses Next.js.

```shell
npm install concurrently --save-dev
```

```json
{
  "scripts": {
    "dev": "concurrently 'mistcss ./app --watch' 'next dev'",
    "build": "mistcss ./app && next build"
  }
}
```

[concurrently](https://github.com/open-cli-tools/concurrently) lets you run commands in parallel in development.

## TailwindCSS

If you're using Next.js, you may need to add [support for nested declarations](https://tailwindcss.com/docs/using-with-preprocessors#nesting).

Use Tailwind's `@apply` directive to style your CSS component. For example:

```css
@scope (.button) {
  button:scope {
    /* ... */
    &[data-danger] {
      @apply bg-red-700 text-white;
    }
  }
}
```

## Ignoring generated files

Since components are generated and shouldn't be edited, there's no need to version control, lint or have them in your code editor explorer panel.

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
