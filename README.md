![Version](https://badgen.net/github/release/lomby92/encore-entrypoints-analyzer)
![License](https://badgen.net/github/license/lomby92/encore-entrypoints-analyzer)
![Total downloads](https://badgen.net/npm/dt/encore-entrypoints-analyzer)
![Continuous Integration](https://github.com/lomby92/encore-entrypoints-analyzer/actions/workflows/ci.yml/badge.svg)
![Publish to NPM](https://github.com/lomby92/encore-entrypoints-analyzer/actions/workflows/release.yml/badge.svg)

# Encore entrypoints analyzer
Webpack plugin for Symfony Encore that shows entrypoints.json file content in an interactive map

## Install
NOTE: this tool is intended to work only with [Symfony Encore](https://github.com/symfony/webpack-encore).
```bash
# NPM
npm install --save-dev encore-entrypoints-analyzer
# Yarn
yarn add -D encore-entrypoints-analyzer
```

## Usage
```js
// File: webpack.config.js
const config = Encore.getWebpackConfig();
...
const EncoreEntrypointsAnalyzerPlugin = require('encore-entrypoints-analyzer');
config.plugins.push(new EncoreEntrypointsAnalyzerPlugin());
```
