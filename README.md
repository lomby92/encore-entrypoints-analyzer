# Encore entrypoints analyzer
Webpack plugin for Symfony Encore that shows entrypoints.json file content in an interactive map

## Install
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
