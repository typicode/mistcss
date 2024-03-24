import assert from 'node:assert'
import fs from 'node:fs'
import test from 'node:test'

import { type Components, parseInput } from './parser.js'

// Fixtures
const mistCss: string = fs.readFileSync('fixtures/Foo.mist.css', 'utf-8')

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
    Baz: {
      tag: 'p',
      data: {},
    },
  }
  assert.deepStrictEqual(actual, expected)
})
