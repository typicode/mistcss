import fs from 'node:fs'
import path from 'node:path'

export interface ParsedInput {
  className: string
  tag: string
  data: Record<string, string[] | boolean>
}

const classNameRegex = /@scope\s*\(\s*\.(?<className>\w+)\s*\)/
const tagRegex = /(?<tag>\w+):scope/
const enumDataAttributeRegex =
  /\[\s*data-(?<attribute>.*?)\s*=\s*["']?(?<value>.*?)["']?\s*\]/g
const booleanDataAttributeRegex = /\[\s*data-(?<attribute>.\w*)\s*\]/g

export function parseInput(input: string): ParsedInput {
  const result: ParsedInput = { className: '', tag: '', data: {} }

  // Parse class name
  const className = classNameRegex.exec(input)?.groups?.['className']
  if (className === undefined) {
    throw new Error('Could not parse class name')
  }
  result.className = className

  // Parse tag
  const tag = tagRegex.exec(input)?.groups?.['tag']
  if (tag === undefined) {
    throw new Error('Could not parse tag')
  }
  result.tag = tag

  // Parse enum data attributes
  for (const match of input.matchAll(enumDataAttributeRegex)) {
    const attribute = match.groups?.['attribute']
    const value = match.groups?.['value'] ?? ''

    if (attribute === undefined) {
      continue
    }

    result.data[attribute] ||= []

    const attr = result.data[attribute]
    if (Array.isArray(attr) && !attr.includes(value)) {
      attr.push(value)
    }
  }

  // Parse boolean data attributes
  for (const match of input.matchAll(booleanDataAttributeRegex)) {
    const attribute = match.groups?.['attribute']
    if (attribute === undefined) {
      continue
    }

    result.data[attribute] ||= true
  }

  return result
}

function renderProps(parsedInput: ParsedInput): string {
  return Object.keys(parsedInput.data)
    .map((attribute) => {
      const values = parsedInput.data[attribute]
      if (Array.isArray(values)) {
        return `${attribute}?: ${values
          .map((value) => `'${value}'`)
          .join(' | ')}`
      }

      return `  ${attribute}?: boolean`
    })
    .join('\n')
}

export function render(name: string, parsedInput: ParsedInput): string {
  return `// Generated by MistCSS, do not modify
import './${name}.mist.css'

type Props = {
  children?: React.ReactNode
  ${renderProps(parsedInput)}
} & JSX.IntrinsicElements['${parsedInput.tag}']

export function ${name}({ children, ${Object.keys(parsedInput.data).join(
    ', ',
  )}, ...props }: Props) {
  return (
    <${parsedInput.tag} {...props} className="${parsedInput.className}" ${Object.keys(
      parsedInput.data,
    )
      .map((key) => `data-${key}={${key}}`)
      .join(' ')}>
      {children}
    </${parsedInput.tag}>
  )
}
`
}

export function createFile(filename: string) {
  let data = fs.readFileSync(filename, 'utf8')
  const parsedInput = parseInput(data)
  const name = path.basename(filename, '.mist.css')
  data = render(name, parsedInput)
  fs.writeFileSync(`${filename}.tsx`, data)
}
