import assert from 'node:assert'
import fs from 'node:fs'
import test from 'node:test'

import { type ParsedInput, parseInput, render } from './index.js'

// Fixtures
const mistCss: string = fs.readFileSync('fixtures/Button.mist.css', 'utf-8')
const tsx: string = fs.readFileSync('fixtures/Button.mist.css.tsx', 'utf-8')

void test('parseInput', () => {
  const input: string = mistCss
  const actual: ParsedInput = parseInput(input)
  const expected: ParsedInput = {
    className: 'button',
    tag: 'button',
    data: {
      size: ['lg', 'sm'],
      danger: true,
    },
  }
  assert.deepStrictEqual(actual, expected)
})

void test.todo('parseInput with empty input', () => {})

void test('render', () => {
  const name = 'Button'
  const parsedInput: ParsedInput = parseInput(mistCss)
  const actual = render(name, parsedInput)
  const expected: string = tsx
  if (process.env['UPDATE']) {
    console.log('Updating fixtures')
    fs.writeFileSync(`fixtures/${name}.mist.css.tsx`, render(name, parsedInput))
  }
  assert.strictEqual(actual, expected)
})
