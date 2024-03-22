import fs from 'node:fs'
import path from 'node:path'
import { compile, Element } from 'stylis'
import { render } from './renderUtils.js'

// Components in a MistCSS file
export type Components = Record<string, Component>

export interface Component {
  tag: string
  data: Record<string, string[] | boolean>
}

const enumDataAttributeRegex =
  /\[data-(?<attribute>[a-z-]+)='(?<value>[^']*)'\]/g
const booleanDataAttributeRegex = /\[data-(?<attribute>[a-z-]+)(?=\])/g

// Visit all nodes in the AST and return @scope and rule nodes
function visit(nodes: Element[]): { type: string; props: string[] }[] {
  return nodes.flatMap((node) => {
    let result: { type: string; props: string[] }[] = []

    if (['@scope', 'rule'].includes(node.type) && Array.isArray(node.props)) {
      result.push({ type: node.type, props: node.props })
    }

    if (Array.isArray(node.children)) {
      result = result.concat(visit(node.children))
    }

    return result
  })
}

export function parseInput(input: string): Components {
  const components: Components = {}

  let name
  const nodes = visit(compile(input))
  for (const node of nodes) {
    // Parse name
    if (node.type === '@scope') {
      const prop = node.props[0]
      if (prop === undefined) {
        throw new Error('Invalid MistCSS file, no class found in @scope')
      }
      name = prop.replace('(.', '').replace(')', '')
      // Convert to PascalCase
      name = name.replace(/(?:^|-)([a-z])/g, (_, g: string) => g.toUpperCase())
      components[name] = { tag: '', data: {} }
      continue
    }

    // Parse tag and data attributes
    if (node.type === 'rule') {
      const prop = node.props[0]
      if (prop === undefined || name === undefined) {
        continue
      }
      const component = components[name]
      if (component === undefined) {
        continue
      }

      // Parse tag
      if (prop.endsWith(':scope')) {
        component.tag = prop.replace(':scope', '')
        continue
      }

      // Parse enum data attributes
      const enumMatches = prop.matchAll(enumDataAttributeRegex)
      for (const match of enumMatches) {
        const attribute = match.groups?.['attribute']
        const value = match.groups?.['value'] ?? ''

        if (attribute !== undefined) {
          // Convert to camelCase
          const camelCasedAttribute = attribute.replace(
            /-([a-z])/g,
            (g) => g[1]?.toUpperCase() ?? '',
          )

          // Initialize data if it doesn't exist
          component.data[camelCasedAttribute] ||= []
          const attr = component.data[camelCasedAttribute]
          if (Array.isArray(attr) && !attr.includes(value)) {
            attr.push(value)
          }
        }
      }

      // Parse boolean data attributes
      const booleanMatches = prop.matchAll(booleanDataAttributeRegex)
      for (const match of booleanMatches) {
        const attribute = match.groups?.['attribute']
        if (attribute !== undefined) {
          component.data[attribute] ||= true
        }
      }
    }
  }

  return components
}

export function createFile(filename: string) {
  let data = fs.readFileSync(filename, 'utf8')
  const parsedInput = parseInput(data)

  const name = path.basename(filename, '.mist.css')
  data = render(name, parsedInput)

  fs.writeFileSync(`${filename}.tsx`, data)
}
