import { renderTemplate } from '../'
import { tree } from '../serialize'
import { remove } from 'fs-extra'
import { resolve } from 'path'

it('complex', async () => {
  const outputPath = resolve(__dirname, 'output-complex')

  const result = await renderTemplate({
    templatePath: resolve(__dirname, 'templates', 'complex'),
    destinationPath: outputPath,
    data: {
      template: {
        name: 'NewProject'
      }
    }
  })

  const structure = await tree({ path: outputPath })

  expect(structure).toMatchSnapshot()

  await remove(outputPath)
})
