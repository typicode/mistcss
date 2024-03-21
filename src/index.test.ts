import assert from 'node:assert'
import fs from 'node:fs'
import test from 'node:test'

import { type Components, parseInput, render } from './index.js'

// Fixtures
const mistCss: string = fs.readFileSync('fixtures/Foo.mist.css', 'utf-8')
const tsx: string = fs.readFileSync('fixtures/Foo.mist.tsx', 'utf-8')

void test('parseInput', () => {
  const input: string = mistCss
  const actual: Components = parseInput(input)
  const expected: Components = {
    Foo: {
      tag: 'div',
      data: {
        fooSize: ['lg', 'sm'],
        x: true,
      },
    },
    Bar: {
      tag: 'span',
      data: {
        barSize: ['lg'],
        x: true,
      },
    },
  }
  assert.deepStrictEqual(actual, expected)
})

void test.todo('parseInput with empty input', () => {})

void test('render', () => {
  const name = 'Foo'
  const parsedInput: Components = parseInput(mistCss)
  const actual = render(name, parsedInput)
  const expected: string = tsx
  if (process.env['UPDATE']) {
    console.log('Updating fixtures')
    fs.writeFileSync(`fixtures/${name}.mist.tsx`, render(name, parsedInput))
  }
  assert.strictEqual(actual, expected)
})
