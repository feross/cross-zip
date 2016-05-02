var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var rimraf = require('rimraf')
var test = require('tape')
var zip = require('../')

var filePath = path.join(__dirname, 'content', 'file.txt')
var fileZipPath = path.join(__dirname, 'content', 'file.txt.zip')
var tmpPath = path.join(__dirname, 'tmp')

mkdirp.sync(tmpPath)

test('unzipSync', function (t) {
  var tmpFilePath = path.join(tmpPath, 'file.txt')
  rimraf.sync(tmpFilePath)
  zip.unzipSync(fileZipPath, tmpPath)

  var tmpFile = fs.readFileSync(tmpFilePath)
  var file = fs.readFileSync(filePath)

  t.deepEqual(tmpFile, file)
  t.end()
})

test('unzip', function (t) {
  t.plan(3)

  var tmpFilePath = path.join(tmpPath, 'file.txt')
  rimraf(tmpFilePath, function (err) {
    t.error(err)

    zip.unzip(fileZipPath, tmpPath, function (err) {
      t.error(err)

      var tmpFile = fs.readFileSync(tmpFilePath)
      var file = fs.readFileSync(filePath)

      t.deepEqual(tmpFile, file)
    })
  })
})
