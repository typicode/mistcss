#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'

import chokidar from 'chokidar'
import { globby } from 'globby'

import { createFile } from './index.js'

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
  createFile(fileOrDir)
} else {
  const cwd = fileOrDir || process.cwd()
  const filenames = await globby('**/*.mist.css', { cwd })

  function handleFile(filename: string) {
    try {
      createFile(path.join(cwd, filename))
    } catch (e) {
      console.error(`Error generating ${filename}`)
      console.error(e)
    }
  }

  // Watch files
  if (values.watch) {
    chokidar.watch('**/*.mist.css', { cwd }).on('change', handleFile)
  }

  // Re-generate all files
  filenames.forEach(handleFile)
}
