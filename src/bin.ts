#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'

import chokidar from 'chokidar'
import { globby } from 'globby'

import {
  genToMistFilename,
  mistToGenFilename,
  safeCreateFile,
} from './writer.js'

function handleMistFileUpdate(cwd: string, filename: string) {
  safeCreateFile(path.join(cwd, filename))
}

function handleMistFileDelete(cwd: string, filename: string) {
  const genFilename = mistToGenFilename(filename)
  if (fs.existsSync(path.join(cwd, genFilename))) {
    fs.unlinkSync(path.join(cwd, genFilename))
  }
}

function handleGenFileWithoutMistFile(cwd: string, filename: string) {
  const mistFilename = genToMistFilename(filename)
  if (!fs.existsSync(path.join(cwd, mistFilename))) {
    fs.unlinkSync(path.join(cwd, filename))
  }
}

const { values, positionals } = parseArgs({
  options: {
    watch: {
      type: 'boolean',
      short: 'w',
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
  safeCreateFile(fileOrDir)
} else {
  const cwd = fileOrDir || process.cwd()

  const mistGlob = '**/*.mist.css'
  const genGlob = '**/*.mist.tsx'

  const mistFiles = await globby(mistGlob, { cwd })
  const genFiles = await globby(genGlob, { cwd })

  // Watch files
  if (values.watch) {
    chokidar
      .watch(mistGlob, { cwd })
      .on('change', (filename) => handleMistFileUpdate(cwd, filename))
      .on('unlink', (filename) => handleMistFileDelete(cwd, filename))
  }

  // Re-generate all files
  mistFiles.forEach((filename) => handleMistFileUpdate(cwd, filename))

  // Clean up generated files without a corresponding mist file
  genFiles.forEach((genFilename) =>
    handleGenFileWithoutMistFile(cwd, genFilename),
  )
}
