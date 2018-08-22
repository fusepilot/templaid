import * as fs from "fs-extra";
import * as path from "path";
import {
  search,
  renderTemplateFile,
  renderTemplateString,
  getTemplatedFilePath,
  getRenderedPath,
  measureTime
} from "./utils";

async function validateTemplatePath(templatePath: string) {
  if (!(await fs.pathExists(templatePath)))
    throw Error(`template ${templatePath} does not exist.`);
}

export interface GetDestinationFilePathProps {
  templatePath: string;
  destinationPath: string;
  file: string;
  data: any;
}

export function getDestinationFilePath({
  templatePath,
  destinationPath,
  file,
  data
}: GetDestinationFilePathProps) {
  const renderedPath = getRenderedPath(file, templatePath, destinationPath);
  return getTemplatedFilePath(renderedPath, data);
}

export interface CreateTemplateProps {
  templatePath: string;
  templateFile: string;
  destinationPath: string;
  data: any;
}

export async function createTemplate({
  templatePath,
  templateFile,
  destinationPath,
  data
}: CreateTemplateProps) {
  await validateTemplatePath(templatePath);

  const template = await renderTemplateFile(templatePath, templateFile, data);

  let newPath = getDestinationFilePath({
    templatePath,
    destinationPath,
    file: template.fullPath,
    data
  });
  await fs.writeFile(newPath, template.content);
}

export interface RenderTemplatesProps {
  templatePath: string;
  templatePattern: string;
  destinationPath: string;
  data: any;
}

export async function renderTemplates({
  templatePath,
  templatePattern,
  destinationPath,
  data
}: RenderTemplatesProps) {
  await validateTemplatePath(templatePath);

  const templateFiles = await search(path.join(templatePath, templatePattern));

  for (const templateFile of templateFiles) {
    await createTemplate({ templatePath, templateFile, destinationPath, data });
  }
}

export interface RenderRegularFilesProps {
  templatePath: string;
  regularPattern: string;
  destinationPath: string;
  data: any;
  ignorePattern?: string;
}

export async function renderRegularFiles({
  templatePath,
  regularPattern,
  destinationPath,
  data,
  ignorePattern
}: RenderRegularFilesProps) {
  await validateTemplatePath(templatePath);

  const files = await search(path.join(templatePath, regularPattern), {
    nodir: true,
    ignore: ignorePattern
  });

  for (const file of files) {
    let newPath = getDestinationFilePath({
      templatePath,
      destinationPath,
      file,
      data
    });

    await fs.copy(file, newPath);
  }
}

export interface RenderFoldersProps {
  templatePath: string;
  folderPattern: string;
  destinationPath: string;
  data: any;
  ignorePattern?: string;
}

export async function renderFolders({
  templatePath,
  folderPattern,
  destinationPath,
  data,
  ignorePattern
}: RenderFoldersProps) {
  await validateTemplatePath(templatePath);

  const folders = await search(path.join(templatePath, folderPattern), {
    ignore: ignorePattern
  });
  // const folders = await search(templateFoldersPattern, {
  //   ignore: patterns.projectTemplatePartialFiles
  // })

  for (const folder of folders) {
    let newPath = getDestinationFilePath({
      templatePath,
      destinationPath,
      file: folder,
      data
    });

    await fs.ensureDir(newPath);
  }
}

export interface RenderMacrosProps {
  templatePath: string;
  macroPattern: string;
  destinationPath: string;
  data: any;
}

export async function renderMacros({
  templatePath,
  macroPattern,
  destinationPath,
  data
}: RenderMacrosProps) {
  await validateTemplatePath(templatePath);

  const macroPaths = await search(path.join(templatePath, macroPattern));

  for (const macroPath of macroPaths) {
    //TODO handle if macro is missing or malformed
    const macro = require(path.resolve(macroPath)).default;

    await macro({
      data,
      search,
      destinationPath,
      renderTemplateFile,
      renderTemplateString,
      getTemplatedFilePath
    });
  }
}

export interface RenderPartialsProps {
  templatePath: string;
  partialPattern: string;
  partialsPath: string;
  destinationPath: string;
  data: any;
}

export async function renderPartials({
  templatePath,
  partialPattern,
  partialsPath,
  destinationPath,
  data
}: RenderPartialsProps) {
  await validateTemplatePath(templatePath);

  const partialPaths = await search(path.join(templatePath, partialPattern));

  for (const partialPath of partialPaths) {
    let newPath = getDestinationFilePath({
      templatePath,
      destinationPath,
      file: partialPath,
      data
    }).replace(".partial", "");

    const partialName = path.basename(newPath);
    const partialTemplatePath = path.join(partialsPath, partialName);

    await fs.copy(partialTemplatePath, newPath);
  }
}

export interface RenderTemplateProps {
  templatePath: string;
  destinationPath: string;
  data?: any;
  partialsPath?: string;
  templatePattern?: string;
  regularPattern?: string;
  folderPattern?: string;
  partialPattern?: string;
  macroPattern?: string;
  ignorePattern?: string;
}

export async function renderTemplate({
  templatePath,
  destinationPath,
  data = {},
  partialsPath = "partials",
  templatePattern = "**/*.template",
  regularPattern = "**/!(*.template|*.template.js|*.partial)",
  macroPattern = "**/*.template.js",
  partialPattern = "**/*.partial",
  folderPattern = "**/",
  ignorePattern
}: RenderTemplateProps) {
  await validateTemplatePath(templatePath);

  const getMeasuredTime = measureTime();

  await renderFolders({
    templatePath,
    folderPattern,
    destinationPath,
    data,
    ignorePattern
  });

  await Promise.all([
    await renderTemplates({
      templatePath,
      templatePattern,
      destinationPath,
      data
    }),
    await renderRegularFiles({
      templatePath,
      regularPattern,
      destinationPath,
      data,
      ignorePattern
    }),
    await renderPartials({
      templatePath,
      partialPattern,
      partialsPath,
      destinationPath,
      data
    })
  ]);

  await renderMacros({ templatePath, macroPattern, destinationPath, data });

  const createdIn = getMeasuredTime();

  // console.log(`"${templatePath}" -> "${destinationPath}" ${createdIn}ms`)

  return {
    templatePath,
    destinationPath,
    createdIn
  };
}
