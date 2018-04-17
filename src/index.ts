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
  if (!await fs.pathExists(templatePath))
    throw Error(`template ${templatePath} does not exist.`);
}

export function getDestinationFilePath(
  templatePath: string,
  destinationPath: string,
  file: string,
  data: any
) {
  const renderedPath = getRenderedPath(file, templatePath, destinationPath);
  return getTemplatedFilePath(renderedPath, data);
}

export async function createTemplate(
  templatePath: string,
  templateFile: string,
  destinationPath: string,
  data: any
) {
  await validateTemplatePath(templatePath);

  const template = await renderTemplateFile(templatePath, templateFile, data);

  let newPath = getDestinationFilePath(
    templatePath,
    destinationPath,
    template.fullPath,
    data
  );
  await fs.writeFile(newPath, template.content);
}

export async function renderTemplates(
  templatePath: string,
  templateFilesPattern: string,
  destinationPath: string,
  data: any
) {
  await validateTemplatePath(templatePath);

  const templateFiles = await search(
    path.join(templatePath, templateFilesPattern)
  );

  for (const templateFile of templateFiles) {
    await createTemplate(templatePath, templateFile, destinationPath, data);
  }
}

export async function renderRegularFiles(
  templatePath: string,
  regularFilesPattern: string,
  destinationPath: string,
  data: any
) {
  await validateTemplatePath(templatePath);

  const files = await search(path.join(templatePath, regularFilesPattern), {
    nodir: true
  });

  for (const file of files) {
    let newPath = getDestinationFilePath(
      templatePath,
      destinationPath,
      file,
      data
    );

    await fs.copy(file, newPath);
  }
}

export async function renderFolders(
  templatePath: string,
  templateFoldersPattern: string,
  destinationPath: string,
  data: any
) {
  await validateTemplatePath(templatePath);

  const folders = await search(path.join(templatePath, templateFoldersPattern));
  // const folders = await search(templateFoldersPattern, {
  //   ignore: patterns.projectTemplatePartialFiles
  // })

  for (const folder of folders) {
    let newPath = getDestinationFilePath(
      templatePath,
      destinationPath,
      folder,
      data
    );

    await fs.ensureDir(newPath);
  }
}

export async function renderMacros(
  templatePath: string,
  templateMacroFilesPattern: string,
  destinationPath: string,
  data: any
) {
  await validateTemplatePath(templatePath);

  const macroPaths = await search(
    path.join(templatePath, templateMacroFilesPattern)
  );

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

export async function renderPartials(
  templatePath: string,
  partialPattern: string,
  partialsPath: string,
  destinationPath: string,
  data: any
) {
  await validateTemplatePath(templatePath);

  const partialPaths = await search(path.join(templatePath, partialPattern));

  for (const partialPath of partialPaths) {
    let newPath = getDestinationFilePath(
      templatePath,
      destinationPath,
      partialPath,
      data
    ).replace(".partial", "");

    const partialName = path.basename(newPath);
    const partialTemplatePath = path.join(partialsPath, partialName);

    await fs.copy(partialTemplatePath, newPath);
  }
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
  folderPattern = "**/"
}: {
  templatePath: string;
  destinationPath: string;
  data?: any;
  partialsPath?: string;
  templatePattern?: string;
  regularPattern?: string;
  folderPattern?: string;
  partialPattern?: string;
  macroPattern?: string;
}) {
  await validateTemplatePath(templatePath);

  const getMeasuredTime = measureTime();

  await renderFolders(templatePath, folderPattern, destinationPath, data);

  await Promise.all([
    await renderTemplates(templatePath, templatePattern, destinationPath, data),
    await renderRegularFiles(
      templatePath,
      regularPattern,
      destinationPath,
      data
    ),
    await renderPartials(
      templatePath,
      partialPattern,
      partialsPath,
      destinationPath,
      data
    )
  ]);

  await renderMacros(templatePath, macroPattern, destinationPath, data);

  const createdIn = getMeasuredTime();

  // console.log(`"${templatePath}" -> "${destinationPath}" ${createdIn}ms`)

  return {
    templatePath,
    destinationPath,
    createdIn
  };
}
