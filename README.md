# cross-zip [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url]

[travis-image]: https://img.shields.io/travis/feross/cross-zip/master.svg
[travis-url]: https://travis-ci.org/feross/cross-zip
[npm-image]: https://img.shields.io/npm/v/cross-zip.svg
[npm-url]: https://npmjs.org/package/cross-zip
[downloads-image]: https://img.shields.io/npm/dm/cross-zip.svg
[downloads-url]: https://npmjs.org/package/cross-zip

### Cross-platform .zip file creation

## install

```
npm install cross-zip
```

## usage

```js
var zip = require('cross-zip')

var inPath = path.join(__dirname, 'myFolder') // folder to zip
var outPath = path.join(__dirname, 'myFile.zip') // name of output zip file

zip(inPath, outPath)
```

## license

MIT. Copyright (c) [Feross Aboukhadijeh](http://feross.org).
