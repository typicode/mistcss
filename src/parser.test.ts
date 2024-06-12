import { test, expect } from 'vitest'

import { parse } from './parser.js'

test('parse', () => {
  const css = `
    /* comment */
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
      comment: 'comment',
      tag: 'div',
      className: 'foo',
      attributes: { 'data-foo': new Set(['one', 'two']) },
      booleanAttributes: new Set(['data-x']),
      properties: new Set(['--foo', '--bar', '--baz', '--qux']),
    },
  ]
  expect(actual).toEqual(expected)
})
