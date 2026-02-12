import { Project, SyntaxKind } from 'ts-morph'
import type { Parsed } from './index'

export type Stats = Record<string, number>

export function stats(parsed: Parsed, projectPath: string): Stats {
  const project = new Project({
    tsConfigFilePath: projectPath,
  })

  const counts: Stats = {}

  // Initialize counts for all tags from parsed
  for (const key in parsed) {
    const tag = parsed[key].tag
    if (tag && !counts[tag]) {
      counts[tag] = 0
    }
  }

  // Get all source files in the project
  const sourceFiles = project.getSourceFiles()

  // Iterate through all source files
  for (const sourceFile of sourceFiles) {
    // Find all JSX elements
    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement)
    const jsxSelfClosingElements = sourceFile.getDescendantsOfKind(
      SyntaxKind.JsxSelfClosingElement
    )

    // Count JSX elements
    for (const element of jsxElements) {
      const openingElement = element.getOpeningElement()
      const tagName = openingElement.getTagNameNode().getText().toLowerCase()
      if (counts.hasOwnProperty(tagName)) {
        counts[tagName]++
      }
    }

    // Count self-closing JSX elements
    for (const element of jsxSelfClosingElements) {
      const tagName = element.getTagNameNode().getText().toLowerCase()
      if (counts.hasOwnProperty(tagName)) {
        counts[tagName]++
      }
    }
  }

  return counts
}
