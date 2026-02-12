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
})
