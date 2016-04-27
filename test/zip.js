var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var test = require('tape')
var zip = require('../')

var filePath = path.join(__dirname, 'content', 'file.txt')
var tmpPath = path.join(__dirname, 'tmp')

mkdirp.sync(tmpPath)

test('zipSync', function (t) {
  var tmpFileZipPath = path.join(tmpPath, 'file.zip.txt')
  zip.zipSync(filePath, tmpFileZipPath)
  zip.unzipSync(tmpFileZipPath, tmpPath)

  var tmpFilePath = path.join(tmpPath, 'file.txt')
  var tmpFile = fs.readFileSync(tmpFilePath)
  var file = fs.readFileSync(filePath)

  t.deepEqual(tmpFile, file)
  t.end()
})

test('zip', function (t) {
  t.plan(3)

  var tmpFileZipPath = path.join(tmpPath, 'file.zip.txt')
  zip.zip(filePath, tmpFileZipPath, function (err) {
    t.error(err)

    zip.unzip(tmpFileZipPath, tmpPath, function (err) {
      t.error(err)

      var tmpFilePath = path.join(tmpPath, 'file.txt')
      var tmpFile = fs.readFileSync(tmpFilePath)
      var file = fs.readFileSync(filePath)

      t.deepEqual(tmpFile, file)
    })
  })
})
