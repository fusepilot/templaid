import { renderTemplate, getDestinationFilePath } from "../src";
import { remove } from "fs-extra";
import jestFs from "jest-plugin-fs";

import { templates } from "../fixtures/templates";

beforeEach(() => {
  jestFs.mock({
    templates
  });
});

afterEach(() => jestFs.restore());

it("can generate a complex template", async () => {
  const outputPath = "/output/complex";

  await renderTemplate({
    templatePath: "/templates/complex",
    destinationPath: outputPath,
    ignorePattern: "**/.gitkeep",
    data: {
      template: {
        name: "NewProject"
      }
    }
  });

  await remove("/templates");

  expect(jestFs.files()).toMatchInlineSnapshot(`
Object {
  "/output/complex/NewProject/NewProject-a.md": "NewProject that should be parsed",
  "/output/complex/NewProject/NewProject-b.md": "{{template.name}} that shouldnt be parsed",
  "/output/complex/NewProject/file-c.md": "file c content",
  "/output/complex/folder-b/.hidden.json": "{ \\"foo\\": \\"bar\\" }",
  "/output/complex/folder-b/NewProject-folder-c/file-d.md": "file d content",
  "/output/complex/folder-b/NewProject-folder-d/file-e.md": "file e content",
  "/output/complex/folder-b/file-f.md": "file f content",
  "/output/complex/folder-c": null,
}
`);
});

it("can generate a simple template with no folders or tokens", async () => {
  const outputPath = "/output/simple";

  await renderTemplate({
    templatePath: "/templates/simple",
    destinationPath: outputPath,
    ignorePattern: "**/.gitkeep"
  });

  await remove("/templates");

  expect(jestFs.files()).toMatchInlineSnapshot(`
Object {
  "/output/simple/file.md": "file content",
}
`);
});

it("can get destination file path", async () => {
  const result = getDestinationFilePath({
    templatePath: "/templates/complex",
    destinationPath: "/output/complex",
    file: "{{template.name}}/{{template.name}}-a.md",
    data: {
      template: {
        name: "NewProject"
      }
    }
  });

  expect(result).toMatchInlineSnapshot(
    `"/Users/michael/Workspace/templaid/NewProject/NewProject-a.md"`
  );
});
