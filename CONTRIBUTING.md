# Contributing

To contribute to `encore-entrypoints-analyzer`, fork the repository and clone it to your machine. [See this GitHub help page for what forking and cloning means](https://help.github.com/articles/fork-a-repo/)

## Setup packages

Next, install this package's dependencies:

```bash
npm install
```
## Develop
There are two ways to locally test changes: with or without a own project.

### Develop without an existing project
Having a local project could be boring and maybe it will require some configuration steps that could be out of the scope. This is why there is a local script `utils/develop.js` that can be run and it will do all boring steps up to the serving of the final HTML page produced by the plugin.
The command to run is just:
```bash
npm run dev
```
NOTE: this command will not watch file changes, so you need to run it every time src files change.

### Develop with your own project
See the well documented [Contributing guide lines of webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer/blob/master/CONTRIBUTING.md#develop-with-your-own-project)

After following these steps, listen for changes to the src code:
```bash
npm run build:watch
```
