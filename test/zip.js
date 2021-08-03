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
  fs.rmSync(tmpFilePath, { recursive: true })
  zip.unzipSync(tmpFileZipPath, tmpPath)

  const tmpFile = fs.readFileSync(tmpFilePath)
  const file = fs.readFileSync(filePath)

  t.deepEqual(tmpFile, file)
  t.end()
})

test('zipSync base folder', function (t) {
  const tmpFileZipPath = path.join(tmpPath, 'file.zip')
  const folderPath = path.join(__dirname, 'content')
  zip.zipSync(folderPath, tmpFileZipPath, { incBase: true })

  const tmpFolderPath = path.join(tmpPath, 'content')
  try {
    fs.rmSync(tmpFolderPath, { recursive: true })
  } catch (err) {
    if (err.code !== 'ENOENT') {
      t.error(err)
    }
  }
  zip.unzipSync(tmpFileZipPath, tmpPath)

  t.true(fs.existsSync(tmpFolderPath), 'extracted folder should exist')

  const tmpFilePath = path.join(tmpFolderPath, 'file.txt')
  t.true(fs.existsSync(tmpFilePath), 'extracted file should exist')

  const tmpFile = fs.readFileSync(tmpFilePath)
  const file = fs.readFileSync(filePath)
  t.deepEqual(tmpFile, file, 'should be deeply equivalent')
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

test('zip base folder', function (t) {
  t.plan(6)

  const tmpFileZipPath = path.join(tmpPath, 'file.zip')
  const folderPath = path.join(__dirname, 'content')
  zip.zip(folderPath, tmpFileZipPath, function (err) {
    t.error(err)

    const tmpFolderPath = path.join(tmpPath, 'content')
    fs.rm(tmpFolderPath, { recursive: true }, function (err) {
      t.error(err)

      zip.unzip(tmpFileZipPath, tmpPath, function (err) {
        t.error(err)

        t.true(fs.existsSync(tmpFolderPath), 'extracted folder should exist')

        const tmpFilePath = path.join(tmpFolderPath, 'file.txt')
        t.true(fs.existsSync(tmpFilePath), 'extracted file should exist')

        const tmpFile = fs.readFileSync(tmpFilePath)
        const file = fs.readFileSync(filePath)
        t.deepEqual(tmpFile, file, 'should be deeply equivalent')
      })
    })
  }, { incBase: true })
})
