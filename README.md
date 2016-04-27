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

zip.zipSync(inPath, outPath)
```

## api

### `zip.zip(inPath, outPath, callback)`

Zip the folder at `inPath` and save it to a .zip file at `outPath`.

### `zip.zipSync(inPath, outPath)`

Sync version of `zip.zip`.

### `zip.unzip(inPath, outPath)`

Unzip the .zip file at `inPath` into the folder at `outPath`.

### `zip.unzipSync(inPath, outPath)`

Sync version of `zip.unzip`.

## license

MIT. Copyright (c) [Feross Aboukhadijeh](http://feross.org).
