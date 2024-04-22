import { attributeToCamelCase, propertyToCamelCase } from "../case.js"
import { Data } from "../parser.js"

// https://html.spec.whatwg.org/multipage/syntax.html#void-elements
const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
])

export function hasChildren(tag: string): boolean {
  return !voidElements.has(tag)
}

// Converts from data attributes to TS types
// [ data-foo: ['one', 'two'] ]-> [ 'foo?: \'one\' | \'two\'' ]
function mapAttributes(attributes: Data['attributes']): string[] {
  return Object.entries(attributes).map(
    ([attribute, set]) =>
      `${attributeToCamelCase(attribute)}?: ${Array.from(set)
        .map((v) => `'${v}'`)
        .join(' | ')}`,
  )
}

// Converts from boolean data attributes to TS types
// [ data-foo ] -> [ 'foo?: boolean' ]
function mapBooleanAttributes(
  booleanAttributes: Data['booleanAttributes'],
): string[] {
  return Array.from(booleanAttributes).map(
    (attribute) => `${attributeToCamelCase(attribute)}?: boolean`,
  )
}

// Converts from custom properties to TS types
// [ --foo: green ] -> foo?: string
function mapProperties(properties: Data['properties']): string[] {
  return Array.from(properties).map(
    (property) => `${propertyToCamelCase(property)}?: string`,
  )
}

export function renderPropsInterface(data: Data) {
  const lines = [
    ...mapAttributes(data.attributes),
    ...mapBooleanAttributes(data.booleanAttributes),
    ...mapProperties(data.properties),
  ]
    .map((l) => `  ${l}`)
    .join('\n')

  return ['interface Props {', lines, '}'].join('\n')
}