#!/usr/bin/env node
import fs = require('node:fs')
import path = require('node:path')
import { parseArgs } from 'node:util'
import type { Parsed } from './index'
const { parse } = require('./index')
const { stats } = require('./stats')

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    stats: {
      type: 'boolean',
      default: false,
    },
  },
  strict: true,
  allowPositionals: true,
})

if (positionals.length === 0) {
  console.error('Error: Please provide a CSS file path')
  console.error('Usage: mistcss <path-to-css-file> [--stats]')
  process.exit(1)
}

const cssPath = positionals[0]
const css = fs.readFileSync(cssPath, 'utf-8')

const parsed = parse(css)

if (values.stats) {
  // Find tsconfig.json in current directory or parent directories
  let currentDir = process.cwd()
  let tsconfigPath = null
  
  while (currentDir !== path.dirname(currentDir)) {
    const candidate = path.join(currentDir, 'tsconfig.json')
    if (fs.existsSync(candidate)) {
      tsconfigPath = candidate
      break
    }
    currentDir = path.dirname(currentDir)
  }
  
  if (!tsconfigPath) {
    console.error('Error: tsconfig.json not found in current directory or parent directories')
    process.exit(1)
  }
  
  const statsResult = stats(parsed, tsconfigPath)
  console.log(JSON.stringify(statsResult, null, 2))
} else {
  // Convert Sets to Arrays for JSON serialization
  const serializable = Object.fromEntries(
    (Object.entries(parsed) as [string, Parsed[string]][]).map(([key, value]) => [
      key,
      {
        ...value,
        attributes: Object.fromEntries(
          Object.entries(value.attributes).map(([k, v]) => [k, Array.from(v)])
        ),
        booleanAttributes: Array.from(value.booleanAttributes),
        properties: Array.from(value.properties),
      },
    ])
  )

  console.log(JSON.stringify(serializable, null, 2))
}
