---
title: Installation
---

```sh
npm install --save-dev mistcss concurrently
```

To avoid having two terminals opened to generate your components and running your dev server, you might want to use `concurrently`.

[concurrently](https://github.com/open-cli-tools/concurrently) lets you run commands in parallel in development.

```json title="package.json" copy
{
  "scripts": {
    "dev-mistcss": "mistcss ./app --watch",
    "dev-next": "next dev",
    "dev": "concurrently 'npm:dev-*'",
    "build": "mistcss ./app && next build"
  }
}
```
