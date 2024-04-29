#!/usr/bin/env node
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { parseArgs } from 'node:util'

import chokidar from 'chokidar'
import { globby } from 'globby'

import { createFile } from './writer.js'
import { Extension } from './types/types.js'

function usage() {
  console.log(`Usage: mistcss <directory> [options]
  --watch, -w    Watch for changes
  --target, -t   Render target (react, hono, astro) [default: react]
`)
}

// Parse args
const { values, positionals } = parseArgs({
  options: {
    watch: {
      type: 'boolean',
      short: 'w',
    },
    target: {
      type: 'string',
      short: 't',
      default: 'react',
    },
  },
  allowPositionals: true,
})
const dir = positionals.at(0)

// Validate args
if (!dir) {
  console.error('Please provide a directory')
  usage()
  process.exit(1)
}

if (!(await fs.stat(dir)).isDirectory()) {
  console.error('The path provided is not a directory')
  usage()
  process.exit(1)
}

if (['react', 'hono', 'astro'].includes(values.target!) === false) {
  console.error('Invalid render option')
  usage()
  process.exit(1)
}

let ext: Extension
switch (values.target) {
  case 'react':
    ext = '.tsx'
    console.log('Rendering React components')
    break
  case 'hono':
    ext = '.tsx'
    console.log('Rendering Hono components')
    break
  case 'astro':
    ext = '.astro'
    console.log('Rendering Astro components')
    break
  default:
    console.error('Invalid render option')
    usage()
    process.exit(1)
}

// Change directory
const cwd = dir || process.cwd()
process.chdir(cwd)

// Watch mist files
if (values.watch) {
  console.log('Watching for changes')
  chokidar
    .watch('**/*.mist.css')
    .on('change', (file) => createFile(file, values.target!, ext))
    .on('unlink', (file) => {
      fs.unlink(file.replace(/\.css$/, ext)).catch(() => false)
    })
}

// Build out files
;(await globby('**/*.mist.css')).forEach((mist) =>
  createFile(mist, values.target!, ext),
)

// Clean up out files without a matching mist file
;(await globby(`**/*.mist.${ext}`)).forEach((file) => {
  const mist = file.replace(new RegExp(`\.${ext}$`), '.css')
  if (!existsSync(mist)) {
    fs.unlink(mist).catch(() => false)
  }
})
