import fs from 'node:fs'
import path from 'node:path'

import { parse } from './parser.js'
import { render } from './renderers/react.js'

// Create a file from a mist file
export function createFile(mist: string, hono?: boolean) {
  try {
    const data = parse(fs.readFileSync(mist, 'utf8'))
    const name = path.basename(mist, '.mist.css')
    if (data[0]) {
      fs.writeFileSync(
        mist.replace(/\.css$/, '.tsx'),
        render(name, data[0], hono),
      )
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(`Error ${mist}: ${e.message}`)
    } else {
      console.error(`Error ${mist}`)
      console.error(e)
    }
  }
}
