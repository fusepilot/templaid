import { Glob } from 'glob'
import * as path from 'path'
import * as fs from 'fs-extra'
import * as handlebars from 'handlebars'

export const search = (pattern: string, options = {}) => {
  return new Promise((resolve, reject) => {
    var g = new Glob(pattern, options)
    g.once('end', resolve)
    g.once('error', reject)
  }) as Promise<string[]>
}

export function renderTemplateString(string: string, data: any) {
  const template = handlebars.compile(string)
  return template(data)
}

export async function renderTemplateFile(
  templateFolderPath: string,
  templatePath: string,
  data: any
) {
  const file = await fs.readFile(templatePath)
  const template = handlebars.compile(file.toString())
  const fullPath = templatePath.replace('.template', '')

  const { dir: parent, base: fileName } = path.parse(fullPath)

  const content = template(data)
  const parentPath = path.relative(templateFolderPath, parent)

  return {
    fileName,
    fullPath,
    parentPath,
    content
  }
}

export function getTemplatedFilePath(filePath: string, data: any) {
  const templateMatch = filePath.match(/{{[^}]*}}/)
  if (templateMatch) {
    return renderTemplateString(filePath, data)
  }
  return filePath
}

export function measureTime(precision = 0) {
  const start = process.hrtime()

  return () => {
    const elapsed = process.hrtime(start)[1] / 1000000
    return elapsed.toFixed(precision)
  }
}

export function getRenderedPath(
  templatePath: string,
  rootPath: string,
  newRootPath: string
) {
  return path.join(newRootPath, path.relative(rootPath, templatePath))
}
