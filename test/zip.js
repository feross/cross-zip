var fs = require('fs')
var path = require('path')
var test = require('tape')
var zip = require('../')

var filePath = path.join(__dirname, 'content', 'file.txt')
var tmpPath = path.join(__dirname, 'tmp')
var contentPath = path.join(__dirname, 'content')
var tmpContentPath = path.join(__dirname, 'tmp', 'content')

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

  var contentZipPathIncludeParentFolder = path.join(tmpPath, 'file2.zip')
  zip.zipSync(contentPath, contentZipPathIncludeParentFolder, true)
  zip.unzipSync(contentZipPathIncludeParentFolder, tmpPath)
  t.ok(fs.existsSync(tmpContentPath) && fs.statSync(tmpContentPath).isDirectory())
  t.deepEqual(fs.readFileSync(path.join(tmpContentPath, 'file.txt')), file)
  fs.rmdirSync(tmpContentPath, { recursive: true })
  fs.rmdirSync(contentZipPathIncludeParentFolder, { recursive: true })

  t.end()
})

test('zip', function (t) {
  t.plan(10)

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

  var contentZipPathIncludeParentFolder = path.join(tmpPath, 'file2.zip')
  zip.zip(contentPath, contentZipPathIncludeParentFolder, true, function (err) {
    t.error(err)

    zip.unzip(contentZipPathIncludeParentFolder, tmpPath, function (err) {
      t.error(err)

      t.ok(fs.existsSync(tmpContentPath) && fs.statSync(tmpContentPath).isDirectory())
      var file = fs.readFileSync(filePath)
      t.deepEqual(fs.readFileSync(path.join(tmpContentPath, 'file.txt')), file)
      fs.rmdir(tmpContentPath, { recursive: true }, function (err) {
        t.error(err)

        fs.rmdir(contentZipPathIncludeParentFolder, { recursive: true }, function (err) {
          t.error(err)
        })
      })
    })
  })
})
