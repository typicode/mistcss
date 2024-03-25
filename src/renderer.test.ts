import assert from 'node:assert'
import fs from 'node:fs'
import test from 'node:test'

import { Components, parseInput } from './parser.js'
import { render } from './renderer.js'

// Fixtures
const mistCSS: string = fs.readFileSync('fixtures/Foo.mist.css', 'utf-8')
const mistTSX: string = fs.readFileSync('fixtures/Foo.mist.tsx', 'utf-8')

void test('render', () => {
  const name = 'Foo'
  const parsedInput: Components = parseInput(mistCSS)
  const actual = render(name, parsedInput)
  const expected: string = mistTSX
  if (process.env['UPDATE']) {
    console.log('Updating fixtures')
    fs.writeFileSync(`fixtures/${name}.mist.tsx`, render(name, parsedInput))
  }
  assert.strictEqual(actual, expected)
})
