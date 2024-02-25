#!/usr/bin/env node
import fs from 'node:fs'
import { parseArgs } from 'node:util'

import chokidar from 'chokidar'
import { globby } from 'globby'

import { genFile } from './index.js'

const { values, positionals } = parseArgs({
  options: {
    watch: {
      type: 'boolean',
      alias: 'w',
      default: false,
    },
  },
  allowPositionals: true,
})
const fileOrDir = positionals.at(0)

if (!fileOrDir) {
  console.error('Please provide a file or directory')
  process.exit(1)
}

if (!fs.existsSync(fileOrDir)) {
  console.error('The file or directory provided does not exist')
  process.exit(1)
}

if (fs.statSync(fileOrDir).isFile()) {
  genFile(fileOrDir)
} else {
  const cwd = fileOrDir || process.cwd()
  const filenames = await globby('**/*.mist.css', { cwd })

  // Watch files
  if (values.watch) {
    chokidar.watch('**/*.mist.css', { cwd }).on('change', genFile)
  }

  // Re-generate all files
  filenames.forEach(genFile)
}
