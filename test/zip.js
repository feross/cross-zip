const fs = require('fs')
const path = require('path')
const test = require('tape')
const zip = require('../')

const filePath = path.join(__dirname, 'content', 'file.txt')
const tmpPath = path.join(__dirname, 'tmp')

fs.mkdirSync(tmpPath, { recursive: true })

test('zipSync', function (t) {
  const tmpFileZipPath = path.join(tmpPath, 'file.zip')
  zip.zipSync(filePath, tmpFileZipPath)

  const tmpFilePath = path.join(tmpPath, 'file.txt')
  fs.rmSync(tmpFilePath, { recursive: true, force: true })
  zip.unzipSync(tmpFileZipPath, tmpPath)

  const tmpFile = fs.readFileSync(tmpFilePath)
  const file = fs.readFileSync(filePath)

  t.deepEqual(tmpFile, file)
  t.end()
})

test('zip', function (t) {
  t.plan(4)

  const tmpFileZipPath = path.join(tmpPath, 'file.zip')
  zip.zip(filePath, tmpFileZipPath, function (err) {
    t.error(err)

    const tmpFilePath = path.join(tmpPath, 'file.txt')
    fs.rm(tmpFilePath, { recursive: true }, function (err) {
      t.error(err)

      zip.unzip(tmpFileZipPath, tmpPath, function (err) {
        t.error(err)

        const tmpFile = fs.readFileSync(tmpFilePath)
        const file = fs.readFileSync(filePath)

        t.deepEqual(tmpFile, file)
      })
    })
  })
})
