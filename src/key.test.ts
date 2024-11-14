import assert from 'node:assert/strict'
import test from 'node:test'
import selectorParser = require('postcss-selector-parser');
import key = require('./key');

const parser = selectorParser()

test("key", async (t) => {
  const arr: [string, string | ErrorConstructor][] = [
    ['div', 'div'],
    ['div[data-foo="bar"]', 'div_data_foo_bar'],
    ['div[data-foo]', 'div_data_foo'],
    ['Div', 'div'],
    ['div[data-Foo]', 'div_data_Foo'],
    ['div[data-foo="1"]', 'div_data_foo_1'],
    ['div[data-1]', 'div_data_1'],
    ['  div[ data-foo ]  ', 'div_data_foo'],
    ['div:not([data-component])', 'div'],
    ['div[data-foo=" bar"]', 'div_data_foo__bar']
  ]
  for (const [input, expected] of arr) {
    await t.test(`${input} → ${expected}`, () => {
      const selector = parser.astSync(input, { lossless: false })
      if (typeof expected === 'string') {
        // @ts-ignore
        const actual = key(selector.nodes[0].nodes[0])
        assert.equal(actual, expected)
      } else {
        // @ts-ignore
        assert.throws(() => key(selector.nodes[0].nodes[0]))
      }
    })
  }
})
