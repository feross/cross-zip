/*! cross-zip. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
module.exports = {
  zip: zip,
  zipSync: zipSync,
  unzip: unzip,
  unzipSync: unzipSync
}

var cp = require('child_process')
var fs = require('fs')
var os = require('os')
var path = require('path')

function zip (inPath, outPath, includeBaseDirectory, cb) {
  if (typeof includeBaseDirectory === 'boolean') {
    if (!cb) cb = function () {}
  } else if (typeof includeBaseDirectory === 'function') {
    cb = includeBaseDirectory
    includeBaseDirectory = false
  } else {
    includeBaseDirectory = arguments.length === 2 ? false : !!includeBaseDirectory
    if (!cb) cb = function () {}
  }

  fs.stat(inPath, function (err, stats) {
    if (err) return cb(err)
    if (stats.isFile()) {
      includeBaseDirectory = false
      copyToTemp()
    } else {
      doZip()
    }
  })

  function copyToTemp () {
    var tmpPath = path.join(os.tmpdir(), 'cross-zip-' + Date.now())
    fs.mkdir(tmpPath, { recursive: true }, function (err) {
      if (err) return cb(err)
      fs.copyFile(inPath, path.join(tmpPath, path.basename(inPath)), function (err) {
        if (err) return cb(err)

        inPath = tmpPath
        doZip()
      })
    })
  }

  // Windows zip command does not overwrite existing files. So do it manually first.
  function doZip () {
    fs.rmdir(outPath, { recursive: true, maxRetries: 3 }, doZip2)
  }

  function doZip2 () {
    const { args, cwd } = getZipArgs(inPath, outPath, includeBaseDirectory)
    var opts = {
      cwd: cwd,
      maxBuffer: Infinity
    }
    cp.execFile(getZipCommand(), args, opts, function (err) {
      cb(err)
    })
  }
}

function zipSync (inPath, outPath, includeBaseDirectory) {
  includeBaseDirectory = !!includeBaseDirectory

  if (fs.statSync(inPath).isFile()) {
    includeBaseDirectory = false
    var tmpPath = path.join(os.tmpdir(), 'cross-zip-' + Date.now())
    fs.mkdirSync(tmpPath, { recursive: true })
    fs.copyFileSync(inPath, path.join(tmpPath, path.basename(inPath)))
    inPath = tmpPath
  }
  fs.rmdirSync(outPath, { recursive: true, maxRetries: 3 })

  const { args, cwd } = getZipArgs(inPath, outPath, includeBaseDirectory)
  var opts = {
    cwd: cwd,
    maxBuffer: Infinity
  }
  cp.execFileSync(getZipCommand(), args, opts)
}

function unzip (inPath, outPath, cb) {
  if (!cb) cb = function () {}
  var opts = {
    maxBuffer: Infinity
  }
  cp.execFile(getUnzipCommand(), getUnzipArgs(inPath, outPath), opts, function (err) {
    cb(err)
  })
}

function unzipSync (inPath, outPath) {
  var opts = {
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

function quotePath (pathToTransform) {
  return '"' + pathToTransform + '"'
}

/**
 * @param {string} inPath
 * @param {string} outPath
 * @param {boolean} includeBaseDirectory
 * @returns {{ args: string[]; cwd: string }}
 */
function getZipArgs (inPath, outPath, includeBaseDirectory) {
  if (process.platform === 'win32') {
    return {
      args: [
        '-nologo',
        '-noprofile',
        '-command', '& { param([String]$myInPath, [String]$myOutPath, [Boolean]$includeBaseDirectory); Add-Type -A "System.IO.Compression.FileSystem"; [IO.Compression.ZipFile]::CreateFromDirectory($myInPath, $myOutPath, [IO.Compression.CompressionLevel]::Fastest, $includeBaseDirectory); exit !$? }',
        '-myInPath', quotePath(inPath),
        '-myOutPath', quotePath(outPath),
        '-includeBaseDirectory', `$${!!includeBaseDirectory}`
      ],
      cwd: process.cwd()
    }
  } else {
    if (includeBaseDirectory) {
      const dir = path.dirname(inPath)
      const fileName = path.basename(inPath)
      return {
        args: ['-r', '-y', outPath, fileName],
        cwd: dir
      }
    }
    return {
      args: ['-r', '-y', outPath, '.'],
      cwd: inPath
    }
  }
}

function getUnzipArgs (inPath, outPath) {
  if (process.platform === 'win32') {
    return [
      '-nologo',
      '-noprofile',
      '-command', '& { param([String]$myInPath, [String]$myOutPath); Add-Type -A "System.IO.Compression.FileSystem"; [IO.Compression.ZipFile]::ExtractToDirectory($myInPath, $myOutPath); exit !$? }',
      '-myInPath', quotePath(inPath),
      '-myOutPath', quotePath(outPath)
    ]
  } else {
    return ['-o', inPath, '-d', outPath]
  }
}
