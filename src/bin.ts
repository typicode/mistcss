#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'

import chokidar from 'chokidar'
import { globby } from 'globby'

import { createFile } from './index.js'

function genToMistFilename(genFilename: string) {
  return genFilename.replace(/\.tsx$/, '')
}

function mistToGenFilename(mistFilename: string) {
  return `${mistFilename}.tsx`
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
  createFile(fileOrDir)
} else {
  const cwd = fileOrDir || process.cwd()

  const mistGlob = '**/*.mist.css'
  const genGlob = '**/*.mist.css.tsx'

  const mistFiles = await globby(mistGlob, { cwd })
  const genFiles = await globby(genGlob, { cwd })

  function handleMistFileUpdate(filename: string) {
    try {
      createFile(path.join(cwd, filename))
    } catch (e) {
      console.error(`Error generating ${filename}`)
      console.error(e)
    }
  }

  function handleMistFileDelete(filename: string) {
    const genFilename = mistToGenFilename(filename)
    if (fs.existsSync(path.join(cwd, genFilename))) {
      fs.unlinkSync(path.join(cwd, genFilename))
    }
  }

  function handleGenFileWithoutMistFile(filename: string) {
    const mistFilename = genToMistFilename(filename)
    if (!fs.existsSync(path.join(cwd, mistFilename))) {
      fs.unlinkSync(path.join(cwd, filename))
    }
  }

  // Watch files
  if (values.watch) {
    chokidar
      .watch(mistGlob, { cwd })
      .on('change', handleMistFileUpdate)
      .on('unlink', handleMistFileDelete)
  }

  // Re-generate all files
  mistFiles.forEach(handleMistFileUpdate)

  // Clean up generated files without a corresponding mist file
  genFiles.forEach((genFilename) => handleGenFileWithoutMistFile(genFilename))
}
