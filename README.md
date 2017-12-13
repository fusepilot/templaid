# Templaid

Declarative filesystem based template rendering with [handlebars.js](https://github.com/wycats/handlebars.js).

## Example

Given the following template folder hierarchy:

```
path/to/template
└─ {{project.name}}
   ├─ {{project.name}}.md
   ├─ file001.txt
   └─ assets
      ├─ {{project.name}}.ae
      └─ {{project.name}}.psd
```

Will render the following hierarchy:

```
path/to/destination
└─ ProjectName
   ├─ ProjectName.md
   ├─ file001.txt
   └─ assets
      ├─ ProjectName.ae
      └─ ProjectName.psd
```

The code:

```js
renderTemplate({
  templatePath: 'path/to/template',
  destinationPath: 'path/to/destination',
  data: {
    project: {
      name: 'NewProject'
    }
  }
})
```

## Template files

Files suffixed with `.template` will be treated as templates. For example, if a
markdown file named `{{project.name}}Readme.md.template` with the following content:

```markdown
### {{project.name}} : {{project.version}}

{{project.description}}
```

With the data:

```json
{
  "name": "MyProject",
  "version": "1.0.0",
  "description": "A description of the project."
}
```

Will create a file named `MyProjectReadme.md` with its contents being:

```markdown
### MyProject : 1.0.0

A description of the project.
```

## Todo

* Document all features ( partials, macros )
* Cover more use cases in tests
