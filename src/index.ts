import fs = require('node:fs')
import { type PluginCreator } from 'postcss'
import selectorParser = require('postcss-selector-parser');
import atImport = require("postcss-import")
import path = require('node:path');
const html = require('./html')

declare module 'postcss-selector-parser' {
  // For some reasons these aren't avaiblable in this module types
  // but are useful to have
  interface Attribute {
    _attribute: string
    _value: string
  }
}

type Parsed = Record<
  string,
  {
    tag: string
    attributes: Record<string, Set<string>>
    booleanAttributes: Set<string>
    properties: Set<string>
  }
>

function render(parsed: Parsed): string {
  let interfaceDefinitions = ''
  const jsxElements: Record<string, string[]> = {}

  Object.entries(parsed).forEach(
    ([key, { tag, attributes, booleanAttributes, properties }]) => {
      const interfaceName = `Mist_${key}`

      const attributeEntries = Object.entries(attributes)

      let htmlElement = 'HTMLElement'
      if (tag in html) {
        htmlElement = html[tag as keyof typeof html]
      }

      let interfaceDefinition = `interface ${interfaceName} extends React.DetailedHTMLProps<React.HTMLAttributes<${htmlElement}>, ${htmlElement}> {\n`

      attributeEntries.forEach(([attr, values]) => {
        const valueType = Array.from(values)
          .map((v) => `'${v}'`)
          .join(' | ')
        interfaceDefinition += `  '${attr}'?: ${valueType}\n`
      })

      booleanAttributes.forEach((attr) => {
        interfaceDefinition += `  '${attr}'?: boolean\n`
      })

      if (Array.from(properties).length > 0) {
        const propertyEntries = Array.from(properties)
          .map((prop) => `'${prop}': string`)
          .join(', ')
        interfaceDefinition += `  style?: { ${propertyEntries} } & React.CSSProperties\n`
      }

      interfaceDefinition += '}\n\n'

      interfaceDefinitions += interfaceDefinition

      if (!jsxElements[tag]) {
        jsxElements[tag] = []
      }
      jsxElements[tag].push(interfaceName)
    },
  )

  // Generate the JSX namespace declaration dynamically
  let jsxDeclaration =
    'declare namespace JSX {\n  interface IntrinsicElements {\n'
  for (const [tag, interfaces] of Object.entries(jsxElements)) {
    jsxDeclaration += `    ${tag}: ${interfaces.join(' | ')}\n`
  }
  jsxDeclaration += '  }\n}\n'

  // Return the full interface definitions and JSX declaration
  return interfaceDefinitions + jsxDeclaration
}

// Turn button[data-component='foo'] into a key that will be used for the interface name
function key(selector: selectorParser.Node): string {
  let key = ''
  if (selector.type === 'tag') {
    key += selector.toString()
  }
  const next = selector.next()
  if (next?.type === 'attribute') {
    const { attribute, value } = next as selectorParser.Attribute
    key += `_${attribute.replace('-', '_')}${value?.replace(/^/, '_').replace(' ', '_').replace('-', '_')}`
  }
  return key
}

function initialParsedValue(): Parsed[keyof Parsed] {
  return {
    tag: '',
    attributes: {},
    booleanAttributes: new Set(),
    properties: new Set(),
  }
}

const _mistcss: PluginCreator<{}> = (_opts = {}) => {
  return {
    postcssPlugin: '_mistcss',
    async Once(root, helper) {
      // Only parse mist.css file
      const from = helper.result.opts.from
      if (from === undefined || path.basename(from) !== 'mist.css') return

      const parsed: Parsed = {}
      let current: Parsed[keyof Parsed] = initialParsedValue()
      root.walkRules((rule) => {
        selectorParser((selectors) => {
          selectors.walk((selector) => {
            if (selector.type === 'tag') {
              current = parsed[key(selector)] = initialParsedValue()
              current.tag = selector.toString()
            }

            if (selector.type === 'attribute') {
              const { attribute, value } = selector as selectorParser.Attribute
              if (value) {
                const values = (current.attributes[attribute] ??=
                  new Set<string>())
                values.add(value)
              } else {
                current.booleanAttributes.add(attribute)
              }
            }
          })
        }).processSync(rule.selector)

        rule.walkDecls(({ prop }) => {
          if (prop.startsWith('--') && prop !== '--apply')
            current.properties.add(prop)
        })
      })
      const rendered = render(parsed)
      const to = path.resolve(from, '../mist.d.ts')
      fs.writeFileSync(to, rendered, 'utf-8')
    },
  }
}

_mistcss.postcss = true

export const mistcss: PluginCreator<{}> = (_opts = {}) => {
  return {
    postcssPlugin: 'mistcss',
    plugins: [atImport(), _mistcss()]
  }
}

mistcss.postcss = true

// Needed to make PostCSS happy
module.exports = mistcss
