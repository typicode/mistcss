#!/usr/bin/env node
import fs from 'node:fs/promises'
import { parseArgs } from 'node:util'

import chokidar from 'chokidar'
import { globby } from 'globby'

import { createFile } from './writer.js'

function usage() {
  console.log(`Usage: mistcss <directory> [options]
  --watch, -w    Watch for changes
  --render, -r   Render mode (react, hono) [default: react]
`)
}

// Parse args
const { values, positionals } = parseArgs({
  options: {
    watch: {
      type: 'boolean',
      short: 'w',
    },
    render: {
      type: 'string',
      short: 'r',
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

if (['react', 'hono'].includes(values.render!) === false) {
  console.error('Invalid render option')
  usage()
  process.exit(1)
}

// Change directory
const cwd = dir || process.cwd()
process.chdir(cwd)

// Watch mist files
if (values.watch) {
  chokidar
    .watch('**/*.mist.css')
    .on('change', (file) =>
      createFile(file, values.render === 'hono' ? true : false),
    )
    .on('unlink', (file) => {
      fs.unlink(file.replace(/\.css$/, '.tsx')).catch(() => false)
    })
}

// Build out files
;(await globby('**/*.mist.css')).forEach((mist) =>
  createFile(mist, values.render === 'hono' ? true : false),
)

// Clean up out files without a matching mist file
;(await globby('**/*.mist.tsx')).forEach((file) => {
  fs.unlink(file.replace(/\.tsx$/, '.css')).catch(() => false)
})
