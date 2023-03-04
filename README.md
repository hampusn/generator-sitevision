# Yeoman generators for Sitevision development

This yeoman generator contains various code generation commands (scaffolding) for common files used in Sitevision development.

## Commands

### Script module
`yo sitevision:script <name>`

Generate files for a script module with velocity and script and, optionally, a stylesheet and a client script.

#### Arguments
|Argument|Description|
|---|---|
|`name`|The name of the script module. Will be hyphenated for filename and css class.|

#### Options
|Option|Description|Default value|
|---|---|---|
|`-s, --styles`|Generate a stylesheet (css).|`false`|
|`-j, --js`|Generate a client script (js).|`false`|
|`-v, --vars`|A comma separated list of scriptVariables to store in settings constant.|`"meta"`|

### Component
`yo sitevision:comp <name>`

Generate files for a React component.

#### Arguments
|Argument|Description|
|---|---|
|`name`|The name of the component. Will be converted to PascalCase for the file names.|

#### Options
|Option|Description|Default value|
|---|---|---|
|`-s, --styles`|Generate a stylesheet (scss).|`false`|

## Links
* https://sitevision.se
* https://yeoman.io
