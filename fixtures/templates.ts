export const complex = {
  "{{template.name}}": {
    "{{template.name}}-a.md.template":
      "{{template.name}} that should be parsed",
    "{{template.name}}-b.md": "{{template.name}} that shouldnt be parsed",
    "file-c.md": "file c content"
  },
  "folder-b": {
    "{{template.name}}-folder-d": {
      "file-e.md": "file e content"
    },
    ".hidden.json": `{ "foo": "bar" }`,
    "{{template.name}}-folder-c": {
      "file-d.md": "file d content"
    },
    "file-f.md": "file f content"
  },
  "folder-c": {
    ".gitkeep": ""
  }
};

export const simple = {
  "file.md": "file content"
};

export const templates = {
  simple,
  complex
};
