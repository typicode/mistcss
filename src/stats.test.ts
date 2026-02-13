import assert = require('node:assert/strict')
import statsModule = require('./stats')
import indexModule = require('./index')
import fs = require('node:fs')
import path = require('node:path')
import os = require('node:os')

const { stats } = statsModule
const { parse } = indexModule
const test: typeof import('node:test').test = require('node:test')

function getCounts(
  result: Record<string, { count: number }>,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(result).map(([key, value]) => [key, value.count]),
  )
}

test('stats', async (t) => {
  let tempDir = ''
  let tsconfigPath = ''

  const writeTestFile = (contents: string) => {
    const testFile = path.join(tempDir, 'test.tsx')
    fs.writeFileSync(testFile, contents)
  }

  const parseSelectors = (selectors: string[]) =>
    parse(selectors.map((selector) => `${selector} {}`).join('\n'))

  t.beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mistcss-test-'))
    tsconfigPath = path.join(tempDir, 'tsconfig.json')
    fs.writeFileSync(
      tsconfigPath,
      JSON.stringify({
        compilerOptions: {
          jsx: 'react',
          target: 'ES2015',
        },
      }),
    )
  })

  t.afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  await t.test('counts tag usage in a simple TSX file', () => {
    writeTestFile(`
        export function App() {
          return (
            <div>
              <button>Click me</button>
              <button>Another button</button>
              <span>Text</span>
            </div>
          )
        }
      `)

    const parsed = parseSelectors(['button', 'div', 'span'])

    const result = stats({ parsed, tsConfigFilePath: tsconfigPath })

    assert.deepEqual(getCounts(result), {
      button: 2,
      div: 1,
      span: 1,
    })
  })

  await t.test('returns zero counts for unused tags', () => {
    writeTestFile(`
        export function App() {
          return <div>Hello</div>
        }
      `)

    const parsed = parseSelectors(['button', 'div'])

    const result = stats({ parsed, tsConfigFilePath: tsconfigPath })

    assert.deepEqual(getCounts(result), {
      button: 0,
      div: 1,
    })
  })

  await t.test('handles self-closing JSX elements', () => {
    writeTestFile(`
        export function App() {
          return (
            <div>
              <input />
              <input />
              <br />
            </div>
          )
        }
      `)

    const parsed = parseSelectors(['input', 'br', 'div'])

    const result = stats({ parsed, tsConfigFilePath: tsconfigPath })

    assert.deepEqual(getCounts(result), {
      input: 2,
      br: 1,
      div: 1,
    })
  })

  await t.test('counts by rootAttribute values', () => {
    writeTestFile(`
        export function App() {
          return (
            <div>
              <button>Regular button</button>
              <button data-variant="primary">Primary button</button>
              <button data-variant="secondary">Secondary button</button>
              <button data-variant="primary">Another primary</button>
            </div>
          )
        }
      `)

    const parsed = parseSelectors([
      'button',
      "button[data-variant='primary']",
      "button[data-variant='secondary']",
    ])

    const result = stats({ parsed, tsConfigFilePath: tsconfigPath })

    assert.deepEqual(getCounts(result), {
      button: 1,
      button_data_variant_primary: 2,
      button_data_variant_secondary: 1,
    })

    assert.deepEqual(result.button_data_variant_primary.attributes, {
      'data-variant': {
        primary: 2,
      },
    })
    assert.deepEqual(result.button_data_variant_secondary.attributes, {
      'data-variant': {
        secondary: 1,
      },
    })
  })

  await t.test(
    'distinguishes between elements with and without rootAttribute',
    () => {
      writeTestFile(`
        export function App() {
          return (
            <div>
              <div>Regular div</div>
              <div data-component="card">Card component</div>
              <div data-component="card">Another card</div>
            </div>
          )
        }
      `)

      const parsed = parseSelectors(['div', "div[data-component='card']"])

      const result = stats({ parsed, tsConfigFilePath: tsconfigPath })

      assert.deepEqual(getCounts(result), {
        div: 2,
        div_data_component_card: 2,
      })
    },
  )

  await t.test('counts boolean-attribute variants from parsed values', () => {
    writeTestFile(`
        export function App() {
          return (
            <div>
              <button>Default</button>
              <button data-disabled>Disabled</button>
              <button data-disabled>Disabled 2</button>
            </div>
          )
        }
      `)

    const parsed = parseSelectors(['button', 'button[data-disabled]'])

    const result = stats({ parsed, tsConfigFilePath: tsconfigPath })

    assert.deepEqual(getCounts(result), {
      button: 1,
      button_data_disabled: 2,
    })
    assert.deepEqual(result.button_data_disabled.booleanAttributes, {
      'data-disabled': 2,
    })
  })

  await t.test(
    'does not fallback to base for unknown rootAttribute values',
    () => {
      writeTestFile(`
        export function App() {
          return (
            <div>
              <button data-variant="ghost">Ghost</button>
              <button data-variant="primary">Primary</button>
              <button>Default</button>
            </div>
          )
        }
      `)

      const parsed = parseSelectors([
        'button',
        "button[data-variant='primary']",
      ])

      const result = stats({ parsed, tsConfigFilePath: tsconfigPath })

      assert.deepEqual(getCounts(result), {
        button: 1,
        button_data_variant_primary: 1,
      })
      assert.deepEqual(result.button_data_variant_primary.attributes, {
        'data-variant': {
          primary: 1,
        },
      })
    },
  )

  await t.test('does not count PascalCase JSX components as HTML tags', () => {
    writeTestFile(`
        function Button() {
          return <button>Wrapped button</button>
        }

        export function App() {
          return (
            <div>
              <Button />
              <button>Native button</button>
            </div>
          )
        }
      `)

    const parsed = parseSelectors(['button'])

    const result = stats({ parsed, tsConfigFilePath: tsconfigPath })

    assert.deepEqual(getCounts(result), {
      button: 2,
    })
  })

  await t.test(
    'keeps zero counts for never used attributes and properties',
    () => {
      writeTestFile(`
        export function App() {
          return (
            <button data-variant="primary" style={{ '--highlightColor': 'red' }}>
              Primary
            </button>
          )
        }
      `)

      const parsed = parseSelectors(["button[data-variant='primary']"])
      parsed.button_data_variant_primary.attributes['data-variant'].add(
        'secondary',
      )
      parsed.button_data_variant_primary.booleanAttributes.add('data-disabled')
      parsed.button_data_variant_primary.properties.add('--highlightColor')
      parsed.button_data_variant_primary.properties.add('--unusedProp')

      const result = stats({ parsed, tsConfigFilePath: tsconfigPath })

      assert.deepEqual(result.button_data_variant_primary, {
        count: 1,
        attributes: {
          'data-variant': {
            primary: 1,
            secondary: 0,
          },
        },
        booleanAttributes: {
          'data-disabled': 0,
        },
        properties: {
          '--highlightColor': 1,
          '--unusedProp': 0,
        },
      })
    },
  )
})
