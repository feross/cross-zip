const fs = require('fs')
const path = require('path')
const test = require('tape')
const zip = require('../')

const filePath = path.join(__dirname, 'content', 'file.txt')
const fileZipPath = path.join(__dirname, 'content', 'file.txt.zip')
const tmpPath = path.join(__dirname, 'tmp')

fs.mkdirSync(tmpPath, { recursive: true })

test('unzipSync', function (t) {
  const tmpFilePath = path.join(tmpPath, 'file.txt')
  fs.rmSync(tmpFilePath, { recursive: true, force: true })
  zip.unzipSync(fileZipPath, tmpPath)

  const tmpFile = fs.readFileSync(tmpFilePath)
  const file = fs.readFileSync(filePath)

  t.deepEqual(tmpFile, file)
  t.end()
})

test('unzip', function (t) {
  t.plan(3)

  const tmpFilePath = path.join(tmpPath, 'file.txt')
  fs.rm(tmpFilePath, { recursive: true }, function (err) {
    t.error(err)

    zip.unzip(fileZipPath, tmpPath, function (err) {
      t.error(err)

      const tmpFile = fs.readFileSync(tmpFilePath)
      const file = fs.readFileSync(filePath)

      t.deepEqual(tmpFile, file)
    })
  })
})

test('unzip from a folder with a space in it', function (t) {
  t.plan(4)

  const zipSpacePath = path.join(
    tmpPath,
    'folder space',
    path.basename(fileZipPath)
  )
  fs.mkdirSync(path.dirname(zipSpacePath), { recursive: true })
  fs.copyFileSync(fileZipPath, zipSpacePath)

  const tmpFilePath = path.join(tmpPath, 'file.txt')
  fs.rm(tmpFilePath, { recursive: true }, function (err) {
    t.error(err)

    zip.unzip(zipSpacePath, tmpPath, function (err) {
      t.error(err)

      t.ok(fs.existsSync(tmpFilePath), 'extracted file should exist')
      const tmpFile = fs.readFileSync(tmpFilePath)
      const file = fs.readFileSync(filePath)

      t.deepEqual(tmpFile, file)
    })
  })
})
