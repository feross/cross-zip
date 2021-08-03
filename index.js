/*! cross-zip. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
module.exports = {
  zip: zip,
  zipSync: zipSync,
  unzip: unzip,
  unzipSync: unzipSync
}

const cp = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

function zip (inPath, outPath, cb, args = { level: 6, incBase: false }) {
  if (!cb) cb = function () {}
  if (process.platform === 'win32') {
    fs.stat(inPath, function (err, stats) {
      if (err) return cb(err)
      if (stats.isFile()) {
        copyToTemp()
      } else {
        prepare()
      }
    })
  } else {
    prepare()
  }

  // Windows zip command cannot zip files, only directories. So move the file into
  // a temporary directory before zipping.
  function copyToTemp () {
    fs.readFile(inPath, function (err, inFile) {
      if (err) return cb(err)
      const tmpPath = path.join(os.tmpdir(), 'cross-zip-' + Date.now())
      fs.mkdir(tmpPath, function (err) {
        if (err) return cb(err)
        fs.writeFile(path.join(tmpPath, path.basename(inPath)), inFile, function (err) {
          if (err) return cb(err)
          inPath = tmpPath
          prepare()
        })
      })
    })
  }

  // Windows zip command does not overwrite existing files. So do it manually first.
  function prepare () {
    if (process.platform === 'win32') {
      fs.rmdirSync(outPath, { recursive: true, maxRetries: 3 })
    }
    execute(args)
  }

  function execute (args) {
    const opts = {
      cwd: path.dirname(inPath),
      maxBuffer: Infinity
    }
    cp.execFile(getZipCommand(), getZipArgs(inPath, outPath, args), opts, function (err) {
      cb(err)
    })
  }
}

function zipSync (inPath, outPath, args) {
  if (process.platform === 'win32') {
    if (fs.statSync(inPath).isFile()) {
      const inFile = fs.readFileSync(inPath)
      const tmpPath = path.join(os.tmpdir(), 'cross-zip-' + Date.now())
      fs.mkdirSync(tmpPath)
      fs.writeFileSync(path.join(tmpPath, path.basename(inPath)), inFile)
      inPath = tmpPath
    }
    fs.rmdirSync(outPath, { recursive: true, maxRetries: 3 })
  }
  const opts = {
    cwd: path.dirname(inPath),
    maxBuffer: Infinity
  }
  cp.execFileSync(getZipCommand(), getZipArgs(inPath, outPath, args), opts)
}

function unzip (inPath, outPath, cb) {
  if (!cb) cb = function () {}
  const opts = {
    maxBuffer: Infinity
  }
  cp.execFile(getUnzipCommand(), getUnzipArgs(inPath, outPath), opts, function (err) {
    cb(err)
  })
}

function unzipSync (inPath, outPath) {
  const opts = {
    maxBuffer: Infinity
  }
  cp.execFileSync(getUnzipCommand(), getUnzipArgs(inPath, outPath), opts)
}

function getZipCommand () {
  if (process.platform === 'win32') {
    return 'powershell.exe'
  } else {
    return 'zip'
  }
}

function getUnzipCommand () {
  if (process.platform === 'win32') {
    return 'powershell.exe'
  } else {
    return 'unzip'
  }
}

function getZipArgs (inPath, outPath, args) {
  let lvl = args?.level
  lvl = parseInt(lvl)
  lvl = isNaN(lvl) ? 6 : lvl
  lvl = Math.max(0, Math.min(lvl, 9)) // Constrain to 0-9 range

  const incBase = args?.incBase ? 1 : 0

  if (process.platform === 'win32') {
    if (!lvl) {
      lvl = 2 // NoCompression
    } else if (lvl < 4) {
      lvl = 1 // Fastest
    } else {
      lvl = 0 // Optimal (default)
    }

    return [
      '-nologo',
      '-noprofile',
      '-command', `& { Add-Type -A "System.IO.Compression.FileSystem"; \`
      [IO.Compression.ZipFile]::CreateFromDirectory("${inPath}", "${outPath}", ${lvl}, ${incBase}); \`
      exit !$? }`
    ]
  } else {
    const fileName = path.basename(inPath)
    return [`-${lvl}`, '-r', '-y', outPath, fileName]
  }
}

function getUnzipArgs (inPath, outPath) {
  if (process.platform === 'win32') {
    return [
      '-nologo',
      '-noprofile',
      '-command', `& { Add-Type -A "System.IO.Compression.FileSystem"; \`
      [IO.Compression.ZipFile]::ExtractToDirectory("${inPath}", "${outPath}"); \`
      exit !$? }`
    ]
  } else {
    return ['-o', inPath, '-d', outPath]
  }
}
