import assert from 'node:assert/strict'
import test from 'node:test'

import { parse } from './parser.js'

void test('parse', () => {
  const css = `
    @scope (div.foo) {
      :scope {
        --foo: green;

        &[data-x] {
          --bar: green;
        }

        &[data-foo='one'] {
          --baz: green;
        }

        &[data-foo="two"] {
          --qux: green;
        }
      }
    }
  `

  const actual = parse(css)
  const expected = [
    {
      tag: 'div',
      className: 'foo',
      attributes: { 'data-foo': new Set(['one', 'two']) },
      booleanAttributes: new Set(['data-x']),
      properties: new Set(['--foo', '--bar', '--baz', '--qux']),
    },
  ]
  assert.deepEqual(actual, expected)
})
