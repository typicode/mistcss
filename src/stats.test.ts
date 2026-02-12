import assert from 'node:assert/strict'
import test from 'node:test'
import { stats } from './stats'
import type { Parsed } from './index'
import fs = require('node:fs')
import path = require('node:path')

test('stats', async (t) => {
  await t.test('counts tag usage in a simple TSX file', () => {
    // Create a temporary test project
    const tempDir = fs.mkdtempSync('/tmp/mistcss-test-')
    
    try {
      // Create a tsconfig.json
      const tsconfigPath = path.join(tempDir, 'tsconfig.json')
      fs.writeFileSync(
        tsconfigPath,
        JSON.stringify({
          compilerOptions: {
            jsx: 'react',
            target: 'ES2015',
          },
        })
      )

      // Create a test TSX file
      const testFile = path.join(tempDir, 'test.tsx')
      fs.writeFileSync(
        testFile,
        `
        export function App() {
          return (
            <div>
              <button>Click me</button>
              <button>Another button</button>
              <span>Text</span>
            </div>
          )
        }
      `
      )

      // Create a parsed object
      const parsed: Parsed = {
        button: {
          tag: 'button',
          rootAttribute: '',
          attributes: {},
          booleanAttributes: new Set(),
          properties: new Set(),
        },
        div: {
          tag: 'div',
          rootAttribute: '',
          attributes: {},
          booleanAttributes: new Set(),
          properties: new Set(),
        },
        span: {
          tag: 'span',
          rootAttribute: '',
          attributes: {},
          booleanAttributes: new Set(),
          properties: new Set(),
        },
      }

      // Run stats
      const result = stats(parsed, tsconfigPath)

      // Verify counts
      assert.equal(result.button, 2, 'Should count 2 button elements')
      assert.equal(result.div, 1, 'Should count 1 div element')
      assert.equal(result.span, 1, 'Should count 1 span element')
    } finally {
      // Cleanup
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  await t.test('returns zero counts for unused tags', () => {
    const tempDir = fs.mkdtempSync('/tmp/mistcss-test-')
    
    try {
      const tsconfigPath = path.join(tempDir, 'tsconfig.json')
      fs.writeFileSync(
        tsconfigPath,
        JSON.stringify({
          compilerOptions: {
            jsx: 'react',
            target: 'ES2015',
          },
        })
      )

      const testFile = path.join(tempDir, 'test.tsx')
      fs.writeFileSync(
        testFile,
        `
        export function App() {
          return <div>Hello</div>
        }
      `
      )

      const parsed: Parsed = {
        button: {
          tag: 'button',
          rootAttribute: '',
          attributes: {},
          booleanAttributes: new Set(),
          properties: new Set(),
        },
        div: {
          tag: 'div',
          rootAttribute: '',
          attributes: {},
          booleanAttributes: new Set(),
          properties: new Set(),
        },
      }

      const result = stats(parsed, tsconfigPath)

      assert.equal(result.button, 0, 'Should count 0 button elements')
      assert.equal(result.div, 1, 'Should count 1 div element')
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  await t.test('handles self-closing JSX elements', () => {
    const tempDir = fs.mkdtempSync('/tmp/mistcss-test-')
    
    try {
      const tsconfigPath = path.join(tempDir, 'tsconfig.json')
      fs.writeFileSync(
        tsconfigPath,
        JSON.stringify({
          compilerOptions: {
            jsx: 'react',
            target: 'ES2015',
          },
        })
      )

      const testFile = path.join(tempDir, 'test.tsx')
      fs.writeFileSync(
        testFile,
        `
        export function App() {
          return (
            <div>
              <input />
              <input />
              <br />
            </div>
          )
        }
      `
      )

      const parsed: Parsed = {
        input: {
          tag: 'input',
          rootAttribute: '',
          attributes: {},
          booleanAttributes: new Set(),
          properties: new Set(),
        },
        br: {
          tag: 'br',
          rootAttribute: '',
          attributes: {},
          booleanAttributes: new Set(),
          properties: new Set(),
        },
        div: {
          tag: 'div',
          rootAttribute: '',
          attributes: {},
          booleanAttributes: new Set(),
          properties: new Set(),
        },
      }

      const result = stats(parsed, tsconfigPath)

      assert.equal(result.input, 2, 'Should count 2 input elements')
      assert.equal(result.br, 1, 'Should count 1 br element')
      assert.equal(result.div, 1, 'Should count 1 div element')
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  await t.test('counts by rootAttribute values', () => {
    const tempDir = fs.mkdtempSync('/tmp/mistcss-test-')
    
    try {
      const tsconfigPath = path.join(tempDir, 'tsconfig.json')
      fs.writeFileSync(
        tsconfigPath,
        JSON.stringify({
          compilerOptions: {
            jsx: 'react',
            target: 'ES2015',
          },
        })
      )

      const testFile = path.join(tempDir, 'test.tsx')
      fs.writeFileSync(
        testFile,
        `
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
      `
      )

      const parsed: Parsed = {
        button: {
          tag: 'button',
          rootAttribute: '',
          attributes: {},
          booleanAttributes: new Set(),
          properties: new Set(),
        },
        button_data_variant_primary: {
          tag: 'button',
          rootAttribute: 'data-variant',
          attributes: {
            'data-variant': new Set(['primary']),
          },
          booleanAttributes: new Set(),
          properties: new Set(),
        },
        button_data_variant_secondary: {
          tag: 'button',
          rootAttribute: 'data-variant',
          attributes: {
            'data-variant': new Set(['secondary']),
          },
          booleanAttributes: new Set(),
          properties: new Set(),
        },
      }

      const result = stats(parsed, tsconfigPath)

      assert.equal(result.button, 1, 'Should count 1 regular button without data-variant')
      assert.equal(result.button_data_variant_primary, 2, 'Should count 2 primary variant buttons')
      assert.equal(result.button_data_variant_secondary, 1, 'Should count 1 secondary variant button')
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  await t.test('distinguishes between elements with and without rootAttribute', () => {
    const tempDir = fs.mkdtempSync('/tmp/mistcss-test-')
    
    try {
      const tsconfigPath = path.join(tempDir, 'tsconfig.json')
      fs.writeFileSync(
        tsconfigPath,
        JSON.stringify({
          compilerOptions: {
            jsx: 'react',
            target: 'ES2015',
          },
        })
      )

      const testFile = path.join(tempDir, 'test.tsx')
      fs.writeFileSync(
        testFile,
        `
        export function App() {
          return (
            <div>
              <div>Regular div</div>
              <div data-component="card">Card component</div>
              <div data-component="card">Another card</div>
            </div>
          )
        }
      `
      )

      const parsed: Parsed = {
        div: {
          tag: 'div',
          rootAttribute: '',
          attributes: {},
          booleanAttributes: new Set(),
          properties: new Set(),
        },
        div_data_component_card: {
          tag: 'div',
          rootAttribute: 'data-component',
          attributes: {
            'data-component': new Set(['card']),
          },
          booleanAttributes: new Set(),
          properties: new Set(),
        },
      }

      const result = stats(parsed, tsconfigPath)

      assert.equal(result.div, 2, 'Should count 2 regular divs (parent + one child without data-component)')
      assert.equal(result.div_data_component_card, 2, 'Should count 2 div elements with data-component="card"')
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })
})

