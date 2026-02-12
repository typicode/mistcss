import { Project, SyntaxKind } from 'ts-morph'
import type { Parsed } from './index'

export type Stats = Record<string, number>

export function stats(parsed: Parsed, projectPath: string): Stats {
  const project = new Project({
    tsConfigFilePath: projectPath,
  })

  const counts: Stats = {}

  // Initialize counts for all parsed entries (including those with rootAttributes)
  for (const key in parsed) {
    counts[key] = 0
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
      countElement(openingElement, parsed, counts)
    }

    // Count self-closing JSX elements
    for (const element of jsxSelfClosingElements) {
      countElement(element, parsed, counts)
    }
  }

  return counts
}

function countElement(
  element: any,
  parsed: Parsed,
  counts: Stats
): void {
  const tagName = element.getTagNameNode().getText().toLowerCase()
  
  // Get attributes from the JSX element
  const attributes = element.getAttributes()
  
  // Try to match with parsed entries
  for (const key in parsed) {
    const entry = parsed[key]
    
    // Check if tag matches
    if (entry.tag !== tagName) {
      continue
    }
    
    // If no rootAttribute, match any element with this tag that doesn't have the rootAttribute
    if (!entry.rootAttribute) {
      // Check if this element has any of the rootAttributes from other entries
      let hasOtherRootAttribute = false
      for (const otherKey in parsed) {
        const otherEntry = parsed[otherKey]
        if (otherEntry.tag === tagName && otherEntry.rootAttribute) {
          // Check if current element has this rootAttribute
          const attr = attributes.find((a: any) => {
            if (a.getKind() === SyntaxKind.JsxAttribute) {
              const attrName = a.getNameNode().getText()
              return attrName === otherEntry.rootAttribute
            }
            return false
          })
          if (attr) {
            hasOtherRootAttribute = true
            break
          }
        }
      }
      
      if (!hasOtherRootAttribute) {
        counts[key]++
        break
      }
    } else {
      // Has rootAttribute - check if element has this attribute with matching value
      const attr = attributes.find((a: any) => {
        if (a.getKind() === SyntaxKind.JsxAttribute) {
          const attrName = a.getNameNode().getText()
          return attrName === entry.rootAttribute
        }
        return false
      })
      
      if (attr) {
        // Check if the attribute value matches any of the expected values
        const initializer = attr.getInitializer()
        if (initializer) {
          const value = initializer.getText().replace(/^["']|["']$/g, '')
          const expectedValues = entry.attributes[entry.rootAttribute]
          if (expectedValues && expectedValues.has(value)) {
            counts[key]++
            break
          }
        }
      }
    }
  }
}
