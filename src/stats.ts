const tsMorph = require('ts-morph') as typeof import('ts-morph')

type Parsed = import('./index').Parsed
type ParsedEntry = Parsed[string]
type JsxAttribute = import('ts-morph').JsxAttribute
type JsxAttributeLike = import('ts-morph').JsxAttributeLike
type JsxOpeningElement = import('ts-morph').JsxOpeningElement
type JsxSelfClosingElement = import('ts-morph').JsxSelfClosingElement
type Expression = import('ts-morph').Expression
type JsxExpression = import('ts-morph').JsxExpression
type ObjectLiteralExpression = import('ts-morph').ObjectLiteralExpression
type PropertyAssignment = import('ts-morph').PropertyAssignment
type ShorthandPropertyAssignment =
  import('ts-morph').ShorthandPropertyAssignment

export type Stats = Record<
  string,
  {
    count: number
    attributes: Record<string, Record<string, number>>
    booleanAttributes: Record<string, number>
    properties: Record<string, number>
  }
>

type StatsOptions = {
  parsed: Parsed
  tsConfigFilePath?: string
}

type VariantMatcher = {
  key: string
  rootAttribute: string
  expectedValues: Set<string>
}

type TagMatchers = {
  baseKey?: string
  unconstrainedFallbackKey?: string
  discriminatorRootAttributes: Set<string>
  booleanDiscriminatorAttributes: Set<string>
  variants: VariantMatcher[]
  booleanVariants: Array<{
    key: string
    requiredAttributes: Set<string>
  }>
}

const { Project, SyntaxKind } = tsMorph

export function stats({ parsed, tsConfigFilePath }: StatsOptions): Stats {
  const project = tsConfigFilePath
    ? new Project({ tsConfigFilePath })
    : new Project()
  const matchersByTag = buildMatchersByTag(parsed)
  const counts = initializeStats(parsed)

  // Get all source files in the project
  const sourceFiles = project.getSourceFiles()

  // Iterate through all source files
  for (const sourceFile of sourceFiles) {
    // Find all JSX elements
    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement)
    const jsxSelfClosingElements = sourceFile.getDescendantsOfKind(
      SyntaxKind.JsxSelfClosingElement,
    )

    // Count JSX elements
    for (const element of jsxElements) {
      const openingElement = element.getOpeningElement()
      countElement(openingElement, matchersByTag, parsed, counts)
    }

    // Count self-closing JSX elements
    for (const element of jsxSelfClosingElements) {
      countElement(element, matchersByTag, parsed, counts)
    }
  }

  return counts
}

function countElement(
  element: JsxOpeningElement | JsxSelfClosingElement,
  matchersByTag: Record<string, TagMatchers>,
  parsed: Parsed,
  counts: Stats,
): void {
  const rawTagName = element.getTagNameNode().getText()
  if (!isIntrinsicTagName(rawTagName)) return
  const tagName = rawTagName.toLowerCase()

  const matchers = matchersByTag[tagName]
  if (!matchers) return

  // Get attributes from the JSX element
  const attributes = element.getAttributes()
  const attributesByName = getAttributesByName(attributes)

  const matchedKey = classifyElement(matchers, attributesByName)
  if (!matchedKey) return

  const entry = parsed[matchedKey]
  if (!entry) return

  counts[matchedKey].count++
  incrementEntryStats(entry, counts[matchedKey], attributesByName)
}

function initializeStats(parsed: Parsed): Stats {
  const counts: Stats = {}

  for (const [key, entry] of Object.entries(parsed)) {
    const attributes: Record<string, Record<string, number>> = {}
    for (const [attribute, values] of Object.entries(entry.attributes)) {
      attributes[attribute] = Object.fromEntries(
        Array.from(values).map((value) => [value, 0]),
      )
    }

    const booleanAttributes: Record<string, number> = Object.fromEntries(
      Array.from(entry.booleanAttributes).map((attribute) => [attribute, 0]),
    )

    const properties: Record<string, number> = Object.fromEntries(
      Array.from(entry.properties).map((property) => [property, 0]),
    )

    counts[key] = {
      count: 0,
      attributes,
      booleanAttributes,
      properties,
    }
  }

  return counts
}

function incrementEntryStats(
  entry: ParsedEntry,
  entryStats: Stats[string],
  attributesByName: Map<string, JsxAttribute>,
): void {
  for (const [attribute, values] of Object.entries(entry.attributes)) {
    const jsxAttribute = attributesByName.get(attribute)
    if (!jsxAttribute) continue

    const value = getAttributeStringValue(jsxAttribute)
    if (!value) continue

    if (values.has(value)) {
      entryStats.attributes[attribute][value]++
    }
  }

  for (const attribute of entry.booleanAttributes) {
    if (attributesByName.has(attribute)) {
      entryStats.booleanAttributes[attribute]++
    }
  }

  const styleAttribute = attributesByName.get('style')
  if (!styleAttribute) return

  for (const property of getStylePropertyNames(styleAttribute)) {
    if (property in entryStats.properties) {
      entryStats.properties[property]++
    }
  }
}

function classifyElement(
  matchers: TagMatchers,
  attributesByName: Map<string, JsxAttribute>,
): string | undefined {
  for (const variant of matchers.variants) {
    const attr = attributesByName.get(variant.rootAttribute)
    if (!attr) continue
    const initializer = attr.getInitializer()
    if (!initializer) continue
    const value = initializer.getText().replace(/^["']|["']$/g, '')
    if (variant.expectedValues.has(value)) {
      return variant.key
    }
  }

  for (const booleanVariant of matchers.booleanVariants) {
    const isMatch = Array.from(booleanVariant.requiredAttributes).every(
      (attributeName) => attributesByName.has(attributeName),
    )
    if (isMatch) {
      return booleanVariant.key
    }
  }

  const hasDiscriminatorAttribute = Array.from(
    matchers.discriminatorRootAttributes,
  ).some((attributeName) => attributesByName.has(attributeName))
  if (hasDiscriminatorAttribute) return undefined

  const hasBooleanDiscriminatorAttribute = Array.from(
    matchers.booleanDiscriminatorAttributes,
  ).some((attributeName) => attributesByName.has(attributeName))
  if (hasBooleanDiscriminatorAttribute) return undefined

  if (matchers.baseKey) {
    return matchers.baseKey
  }

  if (matchers.unconstrainedFallbackKey) {
    return matchers.unconstrainedFallbackKey
  }

  return undefined
}

function buildMatchersByTag(parsed: Parsed): Record<string, TagMatchers> {
  const matchersByTag: Record<string, TagMatchers> = {}

  for (const [key, entry] of Object.entries(parsed)) {
    const tagMatchers = (matchersByTag[entry.tag] ??= {
      baseKey: undefined,
      unconstrainedFallbackKey: undefined,
      discriminatorRootAttributes: new Set<string>(),
      booleanDiscriminatorAttributes: new Set<string>(),
      variants: [],
      booleanVariants: [],
    })

    if (entry.rootAttribute) {
      const expectedValues =
        entry.attributes[entry.rootAttribute] ?? new Set<string>()
      tagMatchers.discriminatorRootAttributes.add(entry.rootAttribute)
      tagMatchers.variants.push({
        key,
        rootAttribute: entry.rootAttribute,
        expectedValues,
      })
      continue
    }

    if (entry.booleanAttributes.size > 0) {
      const requiredAttributes = new Set(entry.booleanAttributes)
      requiredAttributes.forEach((attribute) => {
        tagMatchers.booleanDiscriminatorAttributes.add(attribute)
      })
      tagMatchers.booleanVariants.push({
        key,
        requiredAttributes,
      })
      continue
    }

    if (key === entry.tag) {
      tagMatchers.baseKey = key
    } else if (!tagMatchers.unconstrainedFallbackKey) {
      tagMatchers.unconstrainedFallbackKey = key
    }
  }

  return matchersByTag
}

function getAttributeStringValue(attribute: JsxAttribute): string | undefined {
  const initializer = attribute.getInitializer()
  if (!initializer) return undefined

  if (initializer.getKind() === SyntaxKind.StringLiteral) {
    return (initializer as any).getLiteralText()
  }

  if (initializer.getKind() === SyntaxKind.JsxExpression) {
    const expression = (initializer as JsxExpression).getExpression()
    if (!expression) return undefined
    return getStringFromExpression(expression)
  }

  return undefined
}

function getStringFromExpression(expression: Expression): string | undefined {
  if (expression.getKind() === SyntaxKind.StringLiteral) {
    return (expression as any).getLiteralText()
  }

  if (expression.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
    return (expression as any).getLiteralText()
  }

  return undefined
}

function getStylePropertyNames(styleAttribute: JsxAttribute): Set<string> {
  const propertyNames = new Set<string>()
  const initializer = styleAttribute.getInitializer()
  if (!initializer || initializer.getKind() !== SyntaxKind.JsxExpression) {
    return propertyNames
  }

  const expression = (initializer as JsxExpression).getExpression()
  if (
    !expression ||
    expression.getKind() !== SyntaxKind.ObjectLiteralExpression
  ) {
    return propertyNames
  }

  for (const property of (
    expression as ObjectLiteralExpression
  ).getProperties()) {
    if (property.getKind() === SyntaxKind.PropertyAssignment) {
      const name = (property as PropertyAssignment).getNameNode().getText()
      propertyNames.add(stripQuotes(name))
    }

    if (property.getKind() === SyntaxKind.ShorthandPropertyAssignment) {
      propertyNames.add((property as ShorthandPropertyAssignment).getName())
    }
  }

  return propertyNames
}

function stripQuotes(value: string): string {
  return value.replace(/^["']|["']$/g, '')
}

function getAttributesByName(
  attributes: JsxAttributeLike[],
): Map<string, JsxAttribute> {
  const attributesByName = new Map<string, JsxAttribute>()

  for (const attribute of attributes) {
    if (attribute.getKind() !== SyntaxKind.JsxAttribute) continue
    const jsxAttribute = attribute as JsxAttribute
    attributesByName.set(jsxAttribute.getNameNode().getText(), jsxAttribute)
  }

  return attributesByName
}

function isIntrinsicTagName(tagName: string): boolean {
  const firstChar = tagName[0]
  if (!firstChar) return false
  return firstChar === firstChar.toLowerCase()
}
