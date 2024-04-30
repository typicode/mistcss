#!/usr/bin/env node
import fsPromises from 'node:fs/promises'
import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'

import chokidar from 'chokidar'
import { globby } from 'globby'

import { parse } from './parser.js'
import { render as reactRender } from './renderers/react.js'
import { render as astroRender } from './renderers/astro.js'

type Extension = '.tsx' | '.astro'

function createFile(mist: string, target: string, ext: Extension) {
  try {
    const data = parse(fs.readFileSync(mist, 'utf8'))
    const name = path.basename(mist, '.mist.css')
    if (data[0]) {
      let result = ''
      switch (target) {
        case 'react':
          result = reactRender(name, data[0])
          break
        case 'hono':
          result = reactRender(name, data[0], true)
          break
        case 'astro':
          result = astroRender(name, data[0])
          break
      }
      fs.writeFileSync(mist.replace(/\.css$/, ext), result)
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(`Error ${mist}: ${e.message}`)
    } else {
      console.error(`Error ${mist}`)
      console.error(e)
    }
  }
}

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

if (!(await fsPromises.stat(dir)).isDirectory()) {
  console.error('The path provided is not a directory')
  usage()
  process.exit(1)
}

if (['react', 'hono', 'astro'].includes(values.target!) === false) {
  console.error('Invalid render option')
  usage()
  process.exit(1)
}

// Set extension
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
    console.error('Invalid target option')
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
      fsPromises.unlink(file.replace(/\.css$/, ext)).catch(() => false)
    })
}

// Build out files
;(await globby('**/*.mist.css')).forEach((mist) =>
  createFile(mist, values.target!, ext),
)

// Clean out files without a matching mist file
;(await globby(`**/*.mist.${ext}`)).forEach((file) => {
  const mist = file.replace(new RegExp(`\.${ext}$`), '.css')
  if (!fs.existsSync(mist)) {
    fsPromises.unlink(mist).catch(() => false)
  }
})
