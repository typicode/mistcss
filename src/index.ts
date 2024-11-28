import fs = require('node:fs')
import { type PluginCreator } from 'postcss'
import selectorParser = require('postcss-selector-parser')
import atImport = require('postcss-import')
import path = require('node:path')
const html = require('./html')
const key = require('./key')

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
    rootAttribute: string
    attributes: Record<string, Set<string>>
    booleanAttributes: Set<string>
    properties: Set<string>
  }
>

function render(parsed: Parsed): string {
  let interfaceDefinitions = ''
  const jsxElements: Record<string, string[]> = {}

  // Normalize
  type Component = {
    rootAttribute: string
    discriminatorAttributes: Set<string>
    attributes: Record<string, Set<string>>
    booleanAttributes: Set<string>
    properties: Set<string>
  }

  const normalized: Record<
    string,
    {
      _base: Component
      [other: string]: Component
    }
  > = {}

  Object.entries(parsed).forEach(
    ([
      key,
      { tag, rootAttribute, attributes, booleanAttributes, properties },
    ]) => {
      // Default base tag, always there
      normalized[tag] ??= {
        _base: {
          rootAttribute: '',
          discriminatorAttributes: new Set<string>(),
          attributes: {},
          booleanAttributes: new Set<string>(),
          properties: new Set<string>(),
        },
      }

      if (rootAttribute !== '') {
        normalized[tag][key] ??= {
          rootAttribute,
          discriminatorAttributes: new Set<string>(),
          attributes,
          booleanAttributes,
          properties,
        }
        normalized[tag]['_base']['discriminatorAttributes'] ??= new Set()
        normalized[tag]['_base']['discriminatorAttributes'].add(rootAttribute)
      } else {
        normalized[tag]['_base'] = {
          rootAttribute,
          discriminatorAttributes: new Set<string>(),
          attributes,
          booleanAttributes,
          properties,
        }
      }
    },
  )

  Object.entries(normalized).forEach(([tag, components]) => {
    Object.entries(components).forEach(
      ([
        key,
        {
          rootAttribute,
          discriminatorAttributes,
          attributes,
          booleanAttributes,
          properties,
        },
      ]) => {
        const interfaceName = `Mist_${key === '_base' ? tag : key}`

        const attributeEntries = Object.entries(attributes)

        let htmlElement = 'HTMLElement'
        if (tag in html) {
          htmlElement = html[tag as keyof typeof html]
        }

        let interfaceDefinition = `interface ${interfaceName} extends React.DetailedHTMLProps<React.HTMLAttributes<${htmlElement}>, ${htmlElement}> {\n`

        discriminatorAttributes.forEach((attr) => {
          interfaceDefinition += `  '${attr}'?: never\n`
        })

        attributeEntries.forEach(([attr, values]) => {
          const valueType = Array.from(values)
            .map((v) => `'${v}'`)
            .join(' | ')
          // Root attribute is used to narrow type and therefore is the only attribute
          // that shouldn't be optional (i.e. attr: ... and not attr?: ...)
          interfaceDefinition += `  '${attr}'${rootAttribute === attr ? '' : '?'}: ${valueType}\n`
        })

        booleanAttributes.forEach((attr) => {
          interfaceDefinition += `  '${attr}'?: boolean\n`
        })

        if (Array.from(properties).length > 0) {
          const propertyEntries = Array.from(properties)
            .map((prop) => `'${prop}'?: string`)
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
  })

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

function initialParsedValue(): Parsed[keyof Parsed] {
  return {
    tag: '',
    rootAttribute: '',
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
              current.tag = selector.toString().toLowerCase()
              const next = selector.next()
              if (next?.type === 'attribute') {
                const { attribute, value } = next as selectorParser.Attribute
                if (value) current.rootAttribute = attribute
              }
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
        }).processSync(rule.selector, {
          lossless: false,
        })

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

const mistcss: PluginCreator<{}> = (_opts = {}) => {
  return {
    postcssPlugin: 'mistcss',
    plugins: [atImport(), _mistcss()],
  }
}

mistcss.postcss = true

module.exports = mistcss
