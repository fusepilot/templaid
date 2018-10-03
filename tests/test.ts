import { renderTemplate } from "../src";
import { tree } from "../src/serialize";
import { remove } from "fs-extra";
import { resolve } from "path";
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

  const output = await tree({ path: outputPath });

  expect(output).toMatchInlineSnapshot(`
Object {
  "children": Array [
    Object {
      "children": Array [
        Object {
          "content": "NewProject that should be parsed",
          "kind": "file",
          "name": "NewProject-a.md",
          "path": "NewProject/NewProject-a.md",
        },
        Object {
          "content": "{{template.name}} that shouldnt be parsed",
          "kind": "file",
          "name": "NewProject-b.md",
          "path": "NewProject/NewProject-b.md",
        },
        Object {
          "content": "file c content",
          "kind": "file",
          "name": "file-c.md",
          "path": "NewProject/file-c.md",
        },
      ],
      "kind": "directory",
      "name": "NewProject",
      "path": "NewProject",
    },
    Object {
      "children": Array [
        Object {
          "content": "{ \\"foo\\": \\"bar\\" }",
          "kind": "file",
          "name": ".hidden.json",
          "path": "folder-b/.hidden.json",
        },
        Object {
          "children": Array [
            Object {
              "content": "file d content",
              "kind": "file",
              "name": "file-d.md",
              "path": "folder-b/NewProject-folder-c/file-d.md",
            },
          ],
          "kind": "directory",
          "name": "NewProject-folder-c",
          "path": "folder-b/NewProject-folder-c",
        },
        Object {
          "children": Array [
            Object {
              "content": "file e content",
              "kind": "file",
              "name": "file-e.md",
              "path": "folder-b/NewProject-folder-d/file-e.md",
            },
          ],
          "kind": "directory",
          "name": "NewProject-folder-d",
          "path": "folder-b/NewProject-folder-d",
        },
        Object {
          "content": "file f content",
          "kind": "file",
          "name": "file-f.md",
          "path": "folder-b/file-f.md",
        },
      ],
      "kind": "directory",
      "name": "folder-b",
      "path": "folder-b",
    },
    Object {
      "children": Array [],
      "kind": "directory",
      "name": "folder-c",
      "path": "folder-c",
    },
  ],
  "kind": "directory",
  "name": "complex",
  "path": "",
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

  const output = await tree({ path: outputPath });

  expect(output).toMatchInlineSnapshot(`
Object {
  "children": Array [
    Object {
      "content": "file content",
      "kind": "file",
      "name": "file.md",
      "path": "file.md",
    },
  ],
  "kind": "directory",
  "name": "simple",
  "path": "",
}
`);
});
