#!/usr/bin/env node
import util = require('node:util')
import chalk = require('chalk')
type Parsed = import('./index').Parsed
import index = require('./index')
import statsModule = require('./stats')
const tableLib = require('table') as typeof import('table')

const { parseArgs } = util
const { parseFile } = index
const { stats } = statsModule

type StatsResult = ReturnType<typeof stats>

function formatCount(count: number): string {
  if (count === 0) return chalk.red(String(count))
  return String(count)
}

function formatSelector(selector: string): string {
  if (!selector || selector.startsWith('  ')) return selector
  return chalk.bold(selector)
}

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    stats: {
      type: 'boolean',
      default: false,
    },
    tsconfig: {
      type: 'string',
    },
    pretty: {
      type: 'boolean',
      default: false,
    },
  },
  strict: true,
  allowPositionals: true,
})

function formatPrettyStats(parsed: Parsed, result: StatsResult): string {
  const rows: string[][] = [[chalk.cyan('Selector'), chalk.cyan('Count')]]

  const sortedEntries = Object.entries(parsed).sort(
    ([a], [b]) => result[b].count - result[a].count,
  )

  for (const [key, entry] of sortedEntries) {
    const stat = result[key]
    if (!stat) continue

    let title = entry.tag
    if (entry.rootAttribute) {
      const rootValues = Object.keys(stat.attributes[entry.rootAttribute] ?? {})
      const rootValue = rootValues[0]
      title = rootValue
        ? `${entry.tag}[${entry.rootAttribute}="${rootValue}"]`
        : `${entry.tag}[${entry.rootAttribute}]`
    }
    rows.push([formatSelector(title), formatCount(stat.count)])

    for (const [attribute, values] of Object.entries(stat.attributes)) {
      if (attribute === entry.rootAttribute) continue
      for (const [value, count] of Object.entries(values)) {
        rows.push([
          formatSelector(`  [${attribute}="${value}"]`),
          formatCount(count),
        ])
      }
    }

    for (const [attribute, count] of Object.entries(stat.booleanAttributes)) {
      rows.push([formatSelector(`  [${attribute}]`), formatCount(count)])
    }

    for (const [property, count] of Object.entries(stat.properties)) {
      rows.push([formatSelector(`  style["${property}"]`), formatCount(count)])
    }

    rows.push(['', ''])
  }

  if (rows.length > 1) {
    const last = rows[rows.length - 1]
    if (last[0] === '' && last[1] === '') rows.pop()
  }

  return tableLib.table(rows, {
    columns: {
      1: { alignment: 'right' },
    },
    drawHorizontalLine: (lineIndex, rowCount) =>
      lineIndex === 0 || lineIndex === 1 || lineIndex === rowCount,
  })
}

async function main(): Promise<void> {
  if (positionals.length === 0) {
    console.error('Error: Please provide a CSS file path')
    console.error(
      'Usage: mistcss <path-to-css-file> [--stats] [--tsconfig <path>] [--pretty]',
    )
    process.exit(1)
  }

  const cssPath = positionals[0]
  const parsed = await parseFile(cssPath)

  if (values.stats) {
    const statsResult = stats({ parsed, tsConfigFilePath: values.tsconfig })
    if (values.pretty) {
      console.log(formatPrettyStats(parsed, statsResult))
    } else {
      console.log(JSON.stringify(statsResult, null, 2))
    }
    return
  }

  // Convert Sets to Arrays for JSON serialization
  const serializable = Object.fromEntries(
    (Object.entries(parsed) as [string, Parsed[string]][]).map(
      ([key, value]) => [
        key,
        {
          ...value,
          attributes: Object.fromEntries(
            Object.entries(value.attributes).map(([k, v]) => [
              k,
              Array.from(v),
            ]),
          ),
          booleanAttributes: Array.from(value.booleanAttributes),
          properties: Array.from(value.properties),
        },
      ],
    ),
  )

  console.log(JSON.stringify(serializable, null, 2))
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(1)
})
