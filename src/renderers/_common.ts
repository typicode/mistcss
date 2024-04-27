import { attributeToCamelCase, propertyToCamelCase } from './_case.js'
import { Data } from '../parser.js'

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

// Example:
// interface Props { foo?: 'one' | 'two', bar?: boolean, baz?: string } extends JSX.IntrinsicElements['hr']
export function renderPropsInterface(data: Data, extendedType: string): string {
  return [
    `type Props = {`,
    [
      ...mapAttributes(data.attributes),
      ...mapBooleanAttributes(data.booleanAttributes),
      ...mapProperties(data.properties),
    ].join(', '),
    `} & ${extendedType}`,
  ].join(' ')
}

// Example:
// <div {...props} data-foo={dataFoo} data-bar={dataBar} style={{ '--foo': foo, '--bar': bar }} class="foo">{children}</div>
export function renderTag(data: Data, slotText: string, classText: string): string {
  return [
    `<${data.tag}`,
    '{...props}',
    Object.keys(data.attributes).length
      ? Object.keys(data.attributes)
          .map(
            (attribute) => `${attribute}={${attributeToCamelCase(attribute)}}`,
          )
          .join(' ')
      : null,
    data.booleanAttributes.size
      ? Array.from(data.booleanAttributes)
          .map(
            (attribute) => `${attribute}={${attributeToCamelCase(attribute)}}`,
          )
          .join(' ')
      : null,
    data.properties.size
      ? [
          'style={{ ',
          Array.from(data.properties)
            .map(
              (property) => `'${property}': ${propertyToCamelCase(property)}`,
            )
            .join(', '),
          ' }}',
        ].join('')
      : null,
    `${classText}="${data.className}"`,
    hasChildren(data.tag)
      ? [`>${slotText}</${data.tag}>`]
      : '/>',
  ]
    .filter((x) => x !== null)
    .join(' ')
}