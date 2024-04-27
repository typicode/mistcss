import fs from 'node:fs'
import path from 'node:path'

import { parse } from './parser.js'
import { render as reactRender } from './renderers/react.js'
import { render as astroRender } from './renderers/astro.js'

// Create a file from a mist file
export function createFile(mist: string, target: string, ext: string) {
  try {
    const data = parse(fs.readFileSync(mist, 'utf8'))
    const name = path.basename(mist, '.mist.css')
    if (data[0]) {
        let result = ''
        switch (target) {
          case 'react':
            result = reactRender(name, data[0])
            break
          case 'hono':
            ext = '.tsx'
            result = reactRender(name, data[0], true)
            break
          case 'astro':
            ext = '.astro'
            result = astroRender(name, data[0])
            break
        }
      fs.writeFileSync(
        mist.replace(/\.css$/, ext),
        result,
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
