#!/usr/bin/env node
import { parseArgs } from 'node:util'
import type { Parsed } from './index'
const { parse } = require('./index')

async function main() {
  // Parse command line arguments (no args expected for now)
  parseArgs({
    args: process.argv.slice(2),
    options: {},
    strict: true,
  })

  // Read CSS from stdin
  let css = ''
  
  if (process.stdin.isTTY) {
    console.error('Error: Please provide CSS via stdin')
    console.error('Usage: mistcss < input.css')
    process.exit(1)
  }

  for await (const chunk of process.stdin) {
    css += chunk
  }

  // Parse the CSS
  const parsed = parse(css)

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

  // Output the parsed result as JSON
  console.log(JSON.stringify(serializable, null, 2))
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
