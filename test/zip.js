var fs = require('fs')
var StreamZip = require('node-stream-zip')
var path = require('path')
var test = require('tape')
var zip = require('../')

var filePath = path.join(__dirname, 'content', 'file.txt')
var tmpPath = path.join(__dirname, 'tmp')

fs.mkdirSync(tmpPath, { recursive: true })

test('zipSync', function (t) {
  var tmpFileZipPath = path.join(tmpPath, 'file.zip')
  zip.zipSync(filePath, tmpFileZipPath)

  var tmpFilePath = path.join(tmpPath, 'file.txt')
  fs.rmdirSync(tmpFilePath, { recursive: true })
  zip.unzipSync(tmpFileZipPath, tmpPath)

  var tmpFile = fs.readFileSync(tmpFilePath)
  var file = fs.readFileSync(filePath)

  t.deepEqual(tmpFile, file)
  t.end()
})

test('zip', function (t) {
  t.plan(4)

  var tmpFileZipPath = path.join(tmpPath, 'file.zip')
  zip.zip(filePath, tmpFileZipPath, function (err) {
    t.error(err)

    var tmpFilePath = path.join(tmpPath, 'file.txt')
    fs.rmdir(tmpFilePath, { recursive: true }, function (err) {
      t.error(err)

      zip.unzip(tmpFileZipPath, tmpPath, function (err) {
        t.error(err)

        var tmpFile = fs.readFileSync(tmpFilePath)
        var file = fs.readFileSync(filePath)

        t.deepEqual(tmpFile, file)
      })
    })
  })
})

test('zip slash compatibility', function (t) {
  t.plan(3)

  var tmpFileZipPath = path.join(tmpPath, 'subdir.zip')
  zip.zip(path.join(__dirname, 'content'), tmpFileZipPath, function (err) {
    t.error(err)

    var archive = new StreamZip({
      file: tmpFileZipPath,
      storeEntries: true,
      skipEntryNameValidation: true
    })

    archive.on('ready', function (err) {
      t.error(err)

      // Specifically testing that this is subdir/sub.txt and NOT subdir\sub.txt on windows
      t.deepEquals(Object.keys(archive.entries()), ['file.txt', 'file.txt.zip', 'subdir/sub.txt'])
    })
  })
})
