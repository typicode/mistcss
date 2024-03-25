import assert from 'node:assert'
import fs from 'node:fs'
import test from 'node:test'

import { camelCase, type Components, parseInput, pascalCase } from './parser.js'

// Fixtures
const mistCSS: string = fs.readFileSync('fixtures/Foo.mist.css', 'utf-8')

void test('toCamelCase', () => {
  const arr = ['foo', 'foo-bar', 'f', 'f-b']
  const actual = arr.map(camelCase)
  const expected = ['foo', 'fooBar', 'f', 'fB']
  assert.deepStrictEqual(actual, expected)
})

void test('toPascalCase', () => {
  const arr = ['foo', 'foo-bar', 'f', 'f-b']
  const actual = arr.map(pascalCase)
  const expected = ['Foo', 'FooBar', 'F', 'FB']
  assert.deepStrictEqual(actual, expected)
})

void test('parseInput', () => {
  const input: string = mistCSS
  const actual: Components = parseInput(input)
  const expected: Components = {
    Foo: {
      className: 'foo',
      tag: 'div',
      data: {
        fooSize: ['lg', 'sm'],
        x: true,
      },
    },
    Bar: {
      className: 'bar',
      tag: 'span',
      data: {
        barSize: ['lg'],
        x: true,
      },
    },
    Baz: {
      className: 'baz',
      tag: 'p',
      data: {},
    },
  }
  assert.deepStrictEqual(actual, expected)
})
