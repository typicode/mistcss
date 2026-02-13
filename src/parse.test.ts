import assert = require('node:assert/strict')
import index = require('./index')
import fs = require('node:fs')
import os = require('node:os')
import path = require('node:path')

const { parse, parseFile } = index
const test: typeof import('node:test').test = require('node:test')

test('parse', async (t) => {
  await t.test('parses basic button selector', () => {
    const css = 'button { color: red; }'
    const parsed = parse(css)

    assert.equal(Object.keys(parsed).length, 1)
    assert.ok(parsed.button)
    assert.equal(parsed.button.tag, 'button')
    assert.equal(parsed.button.rootAttribute, '')
    assert.equal(Object.keys(parsed.button.attributes).length, 0)
    assert.equal(parsed.button.booleanAttributes.size, 0)
    assert.equal(parsed.button.properties.size, 0)
  })

  await t.test('parses button with data-variant attribute', () => {
    const css = `
      button[data-variant='primary'] {
        background: blue;
      }
    `
    const parsed = parse(css)

    assert.ok(parsed.button_data_variant_primary)
    assert.equal(parsed.button_data_variant_primary.tag, 'button')
    assert.equal(
      parsed.button_data_variant_primary.rootAttribute,
      'data-variant',
    )
    assert.ok(parsed.button_data_variant_primary.attributes['data-variant'])
    assert.ok(
      parsed.button_data_variant_primary.attributes['data-variant'].has(
        'primary',
      ),
    )
  })

  await t.test('parses multiple variants', () => {
    const css = `
      button {
        padding: 1rem;
        
        &[data-variant='primary'] {
          background: blue;
        }
        
        &[data-variant='secondary'] {
          background: gray;
        }
      }
    `
    const parsed = parse(css)

    assert.ok(parsed.button)
    assert.equal(parsed.button.tag, 'button')
    assert.ok(parsed.button.attributes['data-variant'])
    assert.ok(parsed.button.attributes['data-variant'].has('primary'))
    assert.ok(parsed.button.attributes['data-variant'].has('secondary'))
    assert.equal(parsed.button.attributes['data-variant'].size, 2)
  })

  await t.test('parses boolean attributes', () => {
    const css = `
      button[data-disabled] {
        opacity: 0.5;
      }
    `
    const parsed = parse(css)

    assert.ok(parsed.button_data_disabled)
    assert.equal(parsed.button_data_disabled.tag, 'button')
    assert.ok(
      parsed.button_data_disabled.booleanAttributes.has('data-disabled'),
    )
  })

  await t.test('parses CSS custom properties', () => {
    const css = `
      button {
        --button-color: red;
        --button-size: large;
        color: var(--button-color);
      }
    `
    const parsed = parse(css)

    assert.ok(parsed.button)
    assert.ok(parsed.button.properties.has('--button-color'))
    assert.ok(parsed.button.properties.has('--button-size'))
    assert.equal(parsed.button.properties.size, 2)
  })

  await t.test('parses complex component with data-component attribute', () => {
    const css = `
      div[data-component='card'] {
        background: gray;
        
        &[data-size='sm'] {
          padding: 0.5rem;
        }
        
        &[data-size='xl'] {
          padding: 2rem;
        }
      }
    `
    const parsed = parse(css)

    assert.ok(parsed.div_data_component_card)
    assert.equal(parsed.div_data_component_card.tag, 'div')
    assert.equal(parsed.div_data_component_card.rootAttribute, 'data-component')
    assert.ok(parsed.div_data_component_card.attributes['data-component'])
    assert.ok(
      parsed.div_data_component_card.attributes['data-component'].has('card'),
    )
    assert.ok(parsed.div_data_component_card.attributes['data-size'])
    assert.ok(parsed.div_data_component_card.attributes['data-size'].has('sm'))
    assert.ok(parsed.div_data_component_card.attributes['data-size'].has('xl'))
  })

  await t.test('parses uppercase tag names as lowercase', () => {
    const css = 'DIV { color: red; }'
    const parsed = parse(css)

    assert.ok(parsed.div)
    assert.equal(parsed.div.tag, 'div')
  })

  await t.test('handles empty CSS', () => {
    const css = ''
    const parsed = parse(css)

    assert.equal(Object.keys(parsed).length, 0)
  })

  await t.test('ignores --apply property', () => {
    const css = `
      button {
        --apply: flex;
        --color: red;
      }
    `
    const parsed = parse(css)

    assert.ok(parsed.button)
    assert.ok(parsed.button.properties.has('--color'))
    assert.ok(!parsed.button.properties.has('--apply'))
    assert.equal(parsed.button.properties.size, 1)
  })

  await t.test('handles multi-selector rules', () => {
    const css = `
      button, a {
        --shared-color: blue;
      }
    `
    const parsed = parse(css)

    assert.ok(parsed.button, 'Should have button entry')
    assert.ok(parsed.a, 'Should have a entry')
    assert.ok(
      parsed.button.properties.has('--shared-color'),
      'button should have --shared-color',
    )
    assert.ok(
      parsed.a.properties.has('--shared-color'),
      'a should have --shared-color',
    )
  })

  await t.test('parseFile resolves @import rules', async () => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mistcss-parse-file-'),
    )

    try {
      const importedCssPath = path.join(tempDir, 'button.mist.css')
      const cssPath = path.join(tempDir, 'mist.css')

      fs.writeFileSync(
        importedCssPath,
        `
        button[data-variant='primary'] {
          color: red;
        }
      `,
      )
      fs.writeFileSync(cssPath, `@import './button.mist.css';`)

      const parsed = await parseFile(cssPath)

      assert.ok(parsed.button_data_variant_primary)
      assert.equal(parsed.button_data_variant_primary.tag, 'button')
      assert.equal(
        parsed.button_data_variant_primary.rootAttribute,
        'data-variant',
      )
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })
})
