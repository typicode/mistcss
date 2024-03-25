import fs from 'node:fs'
import path from 'node:path'

import { parseInput } from './parser.js'
import { render } from './renderer.js'

export function genToMistFilename(genFilename: string) {
  return genFilename.replace(/\.tsx$/, '.css')
}

export function mistToGenFilename(mistFilename: string) {
  return mistFilename.replace(/\.css$/, '.tsx')
}

function createFile(filename: string) {
  let data = fs.readFileSync(filename, 'utf8')
  const parsedInput = parseInput(data)

  const name = path.basename(filename, '.mist.css')
  data = render(name, parsedInput)

  fs.writeFileSync(filename.replace('.css', '.tsx'), data)
}

export function safeCreateFile(mistFilename: string) {
  try {
    createFile(mistFilename)
  } catch (e) {
    if (e instanceof Error) {
      console.error(`Error ${mistFilename}: ${e.message}`)
    } else {
      console.error(`Error ${mistFilename}`)
      console.error(e)
    }
  }
}
